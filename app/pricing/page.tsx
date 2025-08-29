import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Check, Sparkles, Zap, Crown } from "lucide-react"

export default function PricingPage() {
    const plans = [
        {
            name: "Free",
            price: "0₽",
            period: "/месяц",
            description: "Для знакомства с возможностями",
            features: [
                "5 документов в месяц",
                "Базовые ИИ функции",
                "Стандартные шаблоны",
                "Email поддержка",
                "Экспорт в PDF"
            ],
            icon: Sparkles,
            popular: false,
            ctaText: "Начать бесплатно"
        },
        {
            name: "Pro",
            price: "990₽",
            period: "/месяц",
            description: "Для профессиональной работы",
            features: [
                "Неограниченное количество документов",
                "Продвинутые ИИ функции",
                "Все шаблоны и стили",
                "Приоритетная поддержка",
                "Экспорт в PDF, Word, PowerPoint",
                "Совместная работа",
                "История версий",
                "API доступ"
            ],
            icon: Zap,
            popular: true,
            ctaText: "Попробовать Pro"
        },
        {
            name: "Enterprise",
            price: "По запросу",
            period: "",
            description: "Для крупных команд и компаний",
            features: [
                "Все функции Pro",
                "Неограниченные пользователи",
                "Корпоративная безопасность",
                "SSO интеграция",
                "Персональный менеджер",
                "SLA гарантии",
                "Кастомные интеграции",
                "Обучение команды"
            ],
            icon: Crown,
            popular: false,
            ctaText: "Связаться с нами"
        }
    ]

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Header */}
            <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">
                        Простые и прозрачные цены
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Выберите план, который подходит вашим потребностям.
                        Все планы включают бесплатный пробный период.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan, index) => {
                            const IconComponent = plan.icon
                            return (
                                <Card
                                    key={index}
                                    className={`relative border-2 transition-all hover:shadow-lg ${plan.popular
                                            ? 'border-blue-500 shadow-lg scale-105'
                                            : 'border-border hover:border-blue-200'
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                                Популярный
                                            </span>
                                        </div>
                                    )}

                                    <CardHeader className="text-center pb-8">
                                        <div className="mx-auto mb-4">
                                            <div className={`h-16 w-16 rounded-full flex items-center justify-center ${plan.popular
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                                                    : 'bg-muted'
                                                }`}>
                                                <IconComponent className={`h-8 w-8 ${plan.popular ? 'text-white' : 'text-muted-foreground'
                                                    }`} />
                                            </div>
                                        </div>
                                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                        <CardDescription className="text-base">
                                            {plan.description}
                                        </CardDescription>
                                        <div className="pt-4">
                                            <span className="text-4xl font-bold">{plan.price}</span>
                                            {plan.period && (
                                                <span className="text-muted-foreground">{plan.period}</span>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-6">
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-start">
                                                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            asChild
                                            className="w-full"
                                            variant={plan.popular ? "gradient" : "outline"}
                                            size="lg"
                                        >
                                            <Link href={plan.name === "Enterprise" ? "/enterprise" : "/app"}>
                                                {plan.ctaText}
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">
                            Часто задаваемые вопросы
                        </h2>

                        <div className="space-y-8">
                            {[
                                {
                                    question: "Можно ли отменить подписку в любое время?",
                                    answer: "Да, вы можете отменить подписку в любое время через настройки аккаунта. Доступ к функциям Pro сохранится до конца оплаченного периода."
                                },
                                {
                                    question: "Есть ли бесплатный пробный период для Pro?",
                                    answer: "Да, мы предоставляем 14-дневный бесплатный пробный период для плана Pro. Никаких обязательств - отмените в любое время."
                                },
                                {
                                    question: "Безопасны ли мои документы?",
                                    answer: "Абсолютно. Мы используем шифрование уровня банков и не передаем ваши данные третьим лицам. Все документы хранятся на защищенных серверах."
                                },
                                {
                                    question: "Можно ли работать в команде?",
                                    answer: "В плане Pro доступна совместная работа до 5 пользователей. Для больших команд рекомендуем план Enterprise."
                                }
                            ].map((faq, index) => (
                                <Card key={index}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{faq.answer}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Готовы начать?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Присоединяйтесь к тысячам пользователей, которые уже используют KelBetty
                    </p>
                    <Button asChild size="lg" variant="gradient" className="text-lg px-8">
                        <Link href="/app">Попробовать бесплатно</Link>
                    </Button>
                </div>
            </section>
        </div>
    )
}
