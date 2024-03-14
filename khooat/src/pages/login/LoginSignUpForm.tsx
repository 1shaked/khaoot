import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { customFetch } from '@/utils/HttpClient';
import { useToast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginSignInPageSchemaZod = z.object({
    email: z.string().email(),
    password: z.string().min(6),

})

export const LoginSignInReturnZod = z.object({
    token: z.string(),
    email: z.string().email(),
})
export type LoginSignInPageSchemaType = z.infer<typeof LoginSignInPageSchemaZod>
export function LoginSignInPage() {
    const { toast } = useToast()
    const navigate = useNavigate()
    const login_sign_up_mutation = useMutation({
        mutationFn: async (data: LoginSignInPageSchemaType) => {
            const action = isLogin ? 'login' : 'signup';
            const respond = await customFetch(`auth/${action}`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            return respond;
        },
        onSuccess: (data) => {
            console.log(data)
            const respond_zod = LoginSignInReturnZod.safeParse(data)
            if (respond_zod.success) {
                // save the token to local storage
                localStorage.setItem('token', respond_zod.data.token)
                // show the toast
                toast({
                    title: 'Account created',
                    description: 'You have successfully created an account',
                    // variant: "success",
                })
                navigate('/')
                return ;
            }
            toast({
                title: 'Error',
                description: 'You can not preform this action, error maybe pay me money and I will solve this for you',
                variant: "destructive",
            })
        }
    })
    const login_sign_form = useForm<LoginSignInPageSchemaType>({
        defaultValues: {
            email: '',
            password: ''
        }
    });
    const [isLogin, setIsLogin] = useState(true)
    return <>
        <form onSubmit={login_sign_form.handleSubmit((data) => {
            console.log(data)
            login_sign_up_mutation.mutate(data)
            // parse the res and show the toast
        })}>
            <div className="flex flex-col space-y-4">
                <label htmlFor="email" className="text-lg font-semibold">Email</label>
                <input
                    id="email"
                    type="email"
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...login_sign_form.register('email', { required: true })}
                />

                <label htmlFor="password" className="text-lg font-semibold">Password</label>
                <input
                    id="password"
                    type="password"
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...login_sign_form.register('password', { required: true })}
                />
            </div>
            <Button type='submit' variant={'secondary'}>Login</Button>
            <Button type='button' onClick={() => {
                setIsLogin(!isLogin)
                login_sign_up_mutation.mutate(login_sign_form.getValues())

            }}>SignUp</Button>
        </form>

    </>
}