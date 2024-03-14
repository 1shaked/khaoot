import { customFetch } from "@/utils/HttpClient"
import { useMutation } from "@tanstack/react-query"
import { useEffect } from "react"
import { useParams } from "react-router-dom"

export function QuestionnaireDetails() {
    // get the current questionnaire id from the url
    const { id } = useParams()

    const get_details_mutation = useMutation({
        mutationKey: ['questionnaire_details', id],
        mutationFn: async () => {
            const response = await customFetch(`questionnaire/${id}/`)
            return response
        },
        onSuccess: (data) => {
            console.log(data)
        }
    
    })

    useEffect(() => {
        get_details_mutation.mutate()
    }, [id])

    if (id === undefined) return <div>url is broken </div>
    return <div>QuestionnaireDetails</div>
}