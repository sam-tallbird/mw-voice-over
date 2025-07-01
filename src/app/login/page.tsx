import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6 mr-10">
          <div className="flex justify-center">
            <img
              src="/klam.svg"
              alt="Klam"
              className="h-10 w-auto"
            />
          </div>
        </div>
        
        <LoginForm redirectTo="/" />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Secure login powered by Supabase</p>
        </div>
      </div>
    </div>
  )
} 