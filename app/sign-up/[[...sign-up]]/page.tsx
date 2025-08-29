import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-2 mb-6">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold">KelBetty</span>
                    </Link>
                    <h1 className="text-2xl font-bold mb-2">Создать аккаунт</h1>
                    <p className="text-muted-foreground">
                        Зарегистрируйтесь, чтобы начать работу с ИИ-редактором
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8">
                    <SignUp
                        appearance={{
                            elements: {
                                rootBox: "mx-auto",
                                card: "shadow-none bg-transparent",
                            }
                        }}
                    />
                </div>

                <div className="text-center mt-6 text-sm text-muted-foreground">
                    Уже есть аккаунт?{' '}
                    <Link href="/sign-in" className="text-blue-600 hover:underline">
                        Войти
                    </Link>
                </div>
            </div>
        </div>
    )
}
