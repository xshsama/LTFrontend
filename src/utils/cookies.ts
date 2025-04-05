/**
 * Cookie工具函数
 */

// 设置cookie
export function setCookie(name: string, value: string, days: number = 7): void {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

// 获取cookie
export function getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

// 删除cookie
export function removeCookie(name: string): void {
    setCookie(name, '', -1);
}

// 存储对象到cookie
export function setObjectInCookie(name: string, object: any, days: number = 7): void {
    const jsonValue = JSON.stringify(object);
    setCookie(name, jsonValue, days);
}

// 从cookie获取对象
export function getObjectFromCookie<T>(name: string): T | null {
    const cookieValue = getCookie(name);
    if (!cookieValue) return null;

    try {
        return JSON.parse(cookieValue) as T;
    } catch (e) {
        console.error(`Error parsing cookie value for ${name}:`, e);
        return null;
    }
}