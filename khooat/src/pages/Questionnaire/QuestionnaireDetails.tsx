import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { customFetch } from "@/utils/HttpClient"
import { Label } from "@radix-ui/react-label"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
// import { useEffect } from "react"
import { Link, useParams } from "react-router-dom"

import {z} from 'zod'

/*{
    "user": null,
    "user_email": "factory@aroma.co.il",
    "id": 2,
    "title": "wwwwwww",
    "questions": null,
    "tornoments": null
} */
// "id": 1,
//       "Questionnaire": null,
//       "Questionnaire_id": 1,
//       "title": "s1",
//       "points": 11,
//       "question_time": 10,
//       "answers": null
export const QuestionSchemaItemZod = z.object({
    id: z.number(),
    title: z.string(),
    points: z.number(),
    question_time: z.number()

})

export const TornomentsItemSchemaZod = z.object({
    id: z.number(),
    time: z.string().optional(),
})

export const QuestionnaireDetailsSchemaZod = z.object({
    title: z.string(),
    id: z.number(),
    questions: z.array(QuestionSchemaItemZod),
    tornoments: z.array(TornomentsItemSchemaZod),
})
export function QuestionnaireDetails() {
    // get the current questionnaire id from the url
    const { id } = useParams()

    const get_details_query = useQuery({
        queryKey: ['questionnaire_details', id],
        queryFn: async () => {
            const response = await customFetch(`questionnaire/${id}/`)
            const respond_zod = QuestionnaireDetailsSchemaZod.safeParse(response)
            if (respond_zod.success) {
                return respond_zod.data
            }
            console.log(respond_zod.error)
            toast({
                title: 'Invalid response id please try again later or contact support',
                variant: 'destructive'
            })
            return null;
        },
    })

    if (id === undefined || get_details_query.data === undefined) return <div>url is broken </div>
    return <main>
        {/* title */}
        <div className="text-2xl">
            {get_details_query.data?.title}
        </div>

        <div>
            <h2 className="">
                Questions
            </h2>
            {get_details_query.data?.questions.map(question => <div 
            className="block border-2 border-gray-300 p-2 m-2 rounded-md hover:bg-gray-200 hover:border-gray-400"
            key={question.id}>
                {question.title}
            </div>)}
            <AddQuestion questionnaire_id={get_details_query.data?.id ?? 1} refetch={() => {
                get_details_query.refetch()
            }}/>
        </div>
        
        <div className="">
            <h2>
                Tornoments
            </h2>
            {get_details_query.data?.tornoments.map(question => <Link 
            className="block border-2 border-gray-300 p-2 m-2 rounded-md hover:bg-gray-200 hover:border-gray-400"
            to={`/questionnaire/${id}/tornoment/${question.id}`}
            key={question.id}>
                {question.time}  {question.id} 
            </Link>)}
        </div>

        {/* <pre>
            {JSON.stringify(get_details_query.data, null , 2)}
        </pre> */}
    </main>
}

interface AddQuestionFormInterface {
    title: string;
    points: number;
    question_time: number;

}

interface AddQuestionProps {
    questionnaire_id: number;
    refetch: () => void;
}
export function AddQuestion(props: AddQuestionProps) {
    const [open, setOpen] = useState(false)
    const add_question_form = useForm<AddQuestionFormInterface>()
    const create_question_mutation = useMutation({
        mutationKey: ['create_question_mutation'],
        mutationFn: async (data: AddQuestionFormInterface) => {
            const response = await customFetch(`question/create`, {
                method: 'POST',
                body: JSON.stringify({
                    ...data,
                    Questionnaire_id: props.questionnaire_id
                })
            })
            return response

        },
        onSuccess: () => {
            props.refetch()
            toast({
                title: 'Question created successfully',            
            })
            setOpen(false)
        }
    })
    return <form onSubmit={add_question_form.handleSubmit(data => {
        create_question_mutation.mutate(data)
    })}>
    <div>
        <button 
        type="button" 
        onClick={() => setOpen(true)}
        className="bg-blue-500 text-white p-2 rounded-md">
            add Question
        </button>
    </div>
    <Dialog open={open} >
    
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add question to questionnaire </DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">
            title
          </Label>
          <input type="text" 
          {...add_question_form.register('title')}
          className="border border-blue-500 w-32 h-8"
          placeholder="title"/>
          {/* <Input id="name" value="Pedro Duarte" className="col-span-3" /> */}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="points" className="text-right">
            points per question
            </Label>
            <input type="number" {...add_question_form.register('points')}
            className="border border-blue-500 w-32 h-8"
            placeholder="points per question" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            
            <Label htmlFor="question_time" className="text-right">
                question time
            </Label>
            <input type="number" {...add_question_form.register('question_time')}
            className="border border-blue-500 w-32 h-8"
            placeholder="10 will be 10s" />
        </div>
      </div>
      <DialogFooter>
        <button
        type="button"
        onClick={() => {
            setOpen(false)
        }}>
            Cancel
        </button>
        <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded-md text-xl"
        onClick={() => {
            create_question_mutation.mutate(add_question_form.getValues())
        }}>
            Create
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
    </form>
}