import { toast } from "@/components/ui/use-toast"
import { customFetch } from "@/utils/HttpClient"
import { useQuery } from "@tanstack/react-query"
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

    if (id === undefined) return <div>url is broken </div>
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