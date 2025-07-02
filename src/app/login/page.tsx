import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-start justify-center p-4 pt-20">
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
        

      </div>
    </div>
  )
} 