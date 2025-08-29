"use client"

import * as React from "react"
import Link from "next/link"
import { useAuth, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { FileText, Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
    const { isSignedIn } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <span className="hidden font-bold sm:inline-block">KelBetty</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6">
                    <Link
                        href="/pricing"
                        className="text-sm font-medium transition-colors hover:text-primary"
                    >
                        Цены
                    </Link>
                    <Link
                        href="/enterprise"
                        className="text-sm font-medium transition-colors hover:text-primary"
                    >
                        Для бизнеса
                    </Link>
                    <ThemeToggle />

                    {isSignedIn ? (
                        <div className="flex items-center space-x-4">
                            <Button asChild variant="default">
                                <Link href="/app">Приложение</Link>
                            </Button>
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Button asChild variant="ghost">
                                <Link href="/sign-in">Войти</Link>
                            </Button>
                            <Button asChild variant="gradient">
                                <Link href="/app">Попробовать Demo</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden flex items-center space-x-2">
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-background">
                    <div className="container py-4 space-y-3">
                        <Link
                            href="/pricing"
                            className="block text-sm font-medium transition-colors hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Цены
                        </Link>
                        <Link
                            href="/enterprise"
                            className="block text-sm font-medium transition-colors hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Для бизнеса
                        </Link>

                        <div className="pt-3 border-t space-y-2">
                            {isSignedIn ? (
                                <div className="space-y-2">
                                    <Button asChild variant="default" className="w-full">
                                        <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
                                            Приложение
                                        </Link>
                                    </Button>
                                    <div className="flex justify-center pt-2">
                                        <UserButton afterSignOutUrl="/" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Button asChild variant="ghost" className="w-full">
                                        <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                                            Войти
                                        </Link>
                                    </Button>
                                    <Button asChild variant="gradient" className="w-full">
                                        <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
                                            Попробовать Demo
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
