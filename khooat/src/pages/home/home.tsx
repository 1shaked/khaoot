
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserGlobalAtom } from "@/state/User"
import { customFetch } from "@/utils/HttpClient"
import { Label } from "@radix-ui/react-label"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useAtom } from "jotai"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { z } from 'zod'


/**{
    "token": "aed808a7-8105-4e12-b320-52e4b95002ee",
    "createdAt": "2024-03-13T15:32:28.085000+00:00",
    "updatedAt": "2024-03-13T15:32:28.085000+00:00",
    "user": null,
    "user_email": "factory@aroma.co.il"
} */
export const UserDetailsSchemaZod = z.object({
    token: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    user_email: z.string().email()
})

export type UserDetailsSchemaType = z.infer<typeof UserDetailsSchemaZod>

export const QuestionnaireItemZod =  z.object({
    title: z.string(),
    id: z.number()
})

export type QuestionnaireItem = z.infer<typeof QuestionnaireItemZod>

export const QuestionnaireListSchemaZod = z.array(QuestionnaireItemZod)
export function HomePage() {
    const [user_global, set_user_global] = useAtom(UserGlobalAtom)
    useQuery({
        queryKey: ['user_details'],
        queryFn: async () => {
            const response = await customFetch('auth/user')
            const respond_zod = UserDetailsSchemaZod.safeParse(response)
            if (!respond_zod.success) {
                throw new Error('Invalid response')
            }
            // save it to local storage
            localStorage.setItem('token', respond_zod.data.token)
            localStorage.setItem('user_email', respond_zod.data.user_email)
            set_user_global(respond_zod.data)
            return respond_zod.data

        },
    })

    const questionnaire_list = useQuery({
        queryKey: ['questionnaire_list'],
        queryFn: async () => {
            const response = await customFetch('questionnaire/list')
            const respond_zod = QuestionnaireListSchemaZod.safeParse(response)
            if (respond_zod.success) {

                return respond_zod.data
            }

            return []
        },
    })
    return <>

        <div className="grid place-items-center text-xl h-[50dvh]">
            Hello - {user_global?.user_email}
        </div>
        {/* list of qu */}
        {questionnaire_list.data?.map((q_item ) => <Link to={`/questionnaire/${q_item.id}`} 
        className="border p-2 m-2 rounded-md cursor-pointer hover:bg-gray-100 block"
        key={q_item.id}>
            {q_item.title}
        </Link>)}
        {/* <pre>
            {JSON.stringify(questionnaire_list.data, null, 2)}
        </pre> */}
        <div className="grid place-items-center">
            <CreateQuestionnaire refetch={questionnaire_list.refetch} />

        </div>
    </>
}


interface CreateQuestionnaireForm {
    title: string;
}
interface CreateQuestionnaireProps {
    refetch: () => void;
}
export function CreateQuestionnaire(props: CreateQuestionnaireProps) {

    const create_questionnaire_mutation = useMutation({
        mutationFn: async (data: CreateQuestionnaireForm) => {
            setIsOpen(false)
            const response = await customFetch('questionnaire/create', {
                method: 'POST',
                body: JSON.stringify(data)
            })
            return response
        },
        onSuccess: () => {
            props.refetch()
        }
    
    })

    const create_questionnaire = useForm<CreateQuestionnaireForm>();
    const [isOpen, setIsOpen] = useState(false)
    return <form
        onSubmit={create_questionnaire.handleSubmit(data => {
            console.log(data)
            create_questionnaire_mutation.mutate(data)
        })}
        className="">
        <button type="button" 
        className="bg-blue-500 text-white p-2 rounded-md"
        onClick={() => {
            setIsOpen(true)
        }}>
            Create Questionnaire
        </button>
        <Dialog open={isOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Welcome create a new questionnaire </DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 items-center">
                        <Label htmlFor="name" className="text-right">
                            title
                        </Label>
                        <input 
                        className="border border-gray-300 w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        type="text" {...create_questionnaire.register('title')} />
                    
                </div>
                <DialogFooter>
                    <button
                    className="bg-blue-500 text-white p-2 rounded-md"
                    onClick={() => {
                        
                        create_questionnaire_mutation.mutate(create_questionnaire.getValues())
                    
                    }}
                    type="submit">Save changes</button>                    
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </form>
}