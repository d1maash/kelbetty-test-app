import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
    if (!date) {
        return 'Неизвестная дата'
    }

    let dateObj: Date

    if (typeof date === 'string') {
        dateObj = new Date(date)
    } else if (date instanceof Date) {
        dateObj = date
    } else {
        return 'Неверный формат даты'
    }

    // Проверяем, что дата валидна
    if (isNaN(dateObj.getTime())) {
        return 'Неверная дата'
    }

    return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(dateObj)
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
}
