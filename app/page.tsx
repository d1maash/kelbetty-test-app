import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import {
    FileText,
    Sparkles,
    Zap,
    Shield,
    Users,
    ArrowRight,
    Check,
    Star
} from "lucide-react"

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 sm:py-32">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
                <div className="relative container mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-8 inline-flex items-center rounded-full border bg-white/50 dark:bg-gray-800/50 px-3 py-1 text-sm backdrop-blur">
                            <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
                            Новое поколение редакторов документов
                        </div>

                        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ИИ-редактор
                            </span>
                            <br />
                            который понимает ваш стиль
                        </h1>

                        <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
                            Создавайте и редактируйте документы с помощью искусственного интеллекта,
                            который сохраняет ваш уникальный стиль форматирования
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" variant="gradient" className="text-lg px-8">
                                <Link href="/app">
                                    Попробовать бесплатно
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="text-lg px-8">
                                <Link href="/pricing">Посмотреть цены</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Почему KelBetty?</h2>
                        <p className="text-muted-foreground text-lg">
                            Мы решили главную проблему ИИ-редакторов — сохранение вашего стиля
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                                    <Sparkles className="h-6 w-6 text-blue-600" />
                                </div>
                                <CardTitle>Умное форматирование</CardTitle>
                                <CardDescription>
                                    ИИ анализирует структуру вашего документа и сохраняет шрифты, отступы и стиль
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                                    <Zap className="h-6 w-6 text-purple-600" />
                                </div>
                                <CardTitle>Мгновенные правки</CardTitle>
                                <CardDescription>
                                    Редактируйте текст одной командой — ИИ внесет изменения, не нарушая форматирование
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                                    <Shield className="h-6 w-6 text-green-600" />
                                </div>
                                <CardTitle>Безопасность данных</CardTitle>
                                <CardDescription>
                                    Ваши документы защищены современным шифрованием и не покидают наши серверы
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Нам доверяют</h2>
                        <div className="flex justify-center items-center space-x-2 mb-8">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                            ))}
                            <span className="ml-2 text-lg font-semibold">4.9/5</span>
                            <span className="text-muted-foreground">(2,000+ отзывов)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Анна Петрова",
                                role: "Копирайтер",
                                content: "Наконец-то ИИ, который не ломает мое форматирование! Экономлю часы на редактировании."
                            },
                            {
                                name: "Михаил Иванов",
                                role: "Юрист",
                                content: "Идеально для работы с юридическими документами. Стиль остается неизменным."
                            },
                            {
                                name: "Елена Смирнова",
                                role: "Маркетолог",
                                content: "Использую для создания презентаций и отчетов. Результат всегда профессиональный."
                            }
                        ].map((testimonial, index) => (
                            <Card key={index} className="border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Готовы попробовать KelBetty?
                    </h2>
                    <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                        Начните использовать ИИ-редактор, который понимает ваш стиль.
                        Бесплатный план включает 5 документов в месяц.
                    </p>
                    <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                        <Link href="/app">
                            Начать бесплатно
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold">KelBetty</span>
                        </div>
                        <div className="flex space-x-6 text-sm text-muted-foreground">
                            <Link href="/privacy" className="hover:text-foreground">
                                Конфиденциальность
                            </Link>
                            <Link href="/terms" className="hover:text-foreground">
                                Условия
                            </Link>
                            <Link href="/support" className="hover:text-foreground">
                                Поддержка
                            </Link>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                        © 2024 KelBetty. Все права защищены.
                    </div>
                </div>
            </footer>
        </div>
    )
}
