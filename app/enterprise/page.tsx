import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Navbar } from "@/components/navbar"
import {
    Shield,
    Users,
    Zap,
    BarChart3,
    Lock,
    Headphones,
    CheckCircle,
    ArrowRight,
    Building2,
    Globe,
    Settings
} from "lucide-react"

export default function EnterprisePage() {
    const features = [
        {
            icon: Shield,
            title: "Корпоративная безопасность",
            description: "SOC 2 Type II, GDPR совместимость, шифрование данных"
        },
        {
            icon: Users,
            title: "Управление командой",
            description: "Неограниченные пользователи, роли и права доступа"
        },
        {
            icon: Settings,
            title: "SSO интеграция",
            description: "Single Sign-On с Active Directory, Okta, Google Workspace"
        },
        {
            icon: BarChart3,
            title: "Аналитика и отчеты",
            description: "Детальная статистика использования и продуктивности"
        },
        {
            icon: Zap,
            title: "API и интеграции",
            description: "REST API, webhooks, интеграция с корпоративными системами"
        },
        {
            icon: Headphones,
            title: "Приоритетная поддержка",
            description: "Персональный менеджер, SLA 99.9%, круглосуточная поддержка"
        }
    ]

    const benefits = [
        "Снижение времени на редактирование документов до 70%",
        "Единообразие стиля во всех корпоративных документах",
        "Безопасная работа с конфиденциальными данными",
        "Интеграция с существующими рабочими процессами",
        "Масштабируемость для команд любого размера"
    ]

    const companies = [
        "Сбербанк", "Яндекс", "Mail.ru Group", "Тинькофф",
        "X5 Retail Group", "МТС", "Лукойл", "Газпром"
    ]

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-6 inline-flex items-center rounded-full border bg-white/50 dark:bg-gray-800/50 px-4 py-2 text-sm backdrop-blur">
                            <Building2 className="mr-2 h-4 w-4 text-blue-600" />
                            Для корпоративных клиентов
                        </div>

                        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                KelBetty Enterprise
                            </span>
                            <br />
                            для вашего бизнеса
                        </h1>

                        <p className="mb-8 text-xl text-muted-foreground max-w-3xl mx-auto">
                            Масштабируемое решение для создания и редактирования документов
                            с ИИ для крупных команд и корпораций
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" variant="gradient" className="text-lg px-8">
                                Запросить демо
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button asChild size="lg" variant="outline" className="text-lg px-8">
                                <Link href="#contact">Связаться с нами</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted by */}
            <section className="py-12 border-b">
                <div className="container mx-auto px-4">
                    <p className="text-center text-muted-foreground mb-8">
                        Нам доверяют ведущие российские компании
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                        {companies.map((company, index) => (
                            <div key={index} className="text-lg font-semibold">
                                {company}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">
                            Корпоративные возможности
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Все что нужно для работы с документами в крупной организации
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon
                            return (
                                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                    <CardHeader>
                                        <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                                            <IconComponent className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                        <CardDescription className="text-base">
                                            {feature.description}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">
                                Преимущества для бизнеса
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                Измеримые результаты для вашей организации
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div>
                                <ul className="space-y-4">
                                    {benefits.map((benefit, index) => (
                                        <li key={index} className="flex items-start">
                                            <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                            <span className="text-lg">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                                <h3 className="text-2xl font-bold mb-4">Статистика клиентов</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-3xl font-bold">70%</div>
                                        <div className="text-blue-100">экономия времени</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">99.9%</div>
                                        <div className="text-blue-100">uptime SLA</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">500+</div>
                                        <div className="text-blue-100">довольных компаний</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-8">
                            <Lock className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold mb-4">
                                Безопасность на первом месте
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                Ваши данные защищены стандартами банковского уровня
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Шифрование</CardTitle>
                                    <CardDescription>
                                        AES-256 шифрование данных в покое и при передаче
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Соответствие</CardTitle>
                                    <CardDescription>
                                        GDPR, SOC 2 Type II, ISO 27001 сертификация
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Аудит</CardTitle>
                                    <CardDescription>
                                        Полное логирование и аудит всех действий пользователей
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section id="contact" className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">
                                Свяжитесь с нами
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                Расскажите о ваших потребностях, и мы подберем оптимальное решение
                            </p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Запросить консультацию</CardTitle>
                                <CardDescription>
                                    Наш специалист свяжется с вами в течение 24 часов
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Имя *</label>
                                            <Input placeholder="Ваше имя" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Email *</label>
                                            <Input type="email" placeholder="email@company.com" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Компания *</label>
                                            <Input placeholder="Название компании" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Размер команды</label>
                                            <Input placeholder="Количество сотрудников" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Сообщение</label>
                                        <Textarea
                                            placeholder="Расскажите о ваших потребностях и задачах"
                                            className="min-h-[120px]"
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" variant="gradient" size="lg">
                                        Отправить запрос
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    )
}
