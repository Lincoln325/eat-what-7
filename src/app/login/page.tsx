import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: '登入 · 食乜7',
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-dvh max-w-[430px] mx-auto bg-background px-6 justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
          食乜<span className="text-primary">7</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-2">登入嚟揀今餐食乜</p>
      </div>
      <LoginForm />
    </div>
  )
}
