import { useErrorBoundary } from "react-error-boundary";

const ErrorFallback = ({ error }) => {
  const { resetBoundary } = useErrorBoundary();

  return (
    <div className="h-screen bg-black text-center text-gray-300 font-mono flex flex-col items-center justify-center">
      <div class="min-h-screen flex flex-grow items-center justify-center bg-gray-50">
        <div class="rounded-lg bg-white p-8 text-center shadow-xl">
          <h1 class="mb-4 text-4xl font-bold">404</h1>
          <p class="text-gray-600">Something went wrong:</p>
          <pre className="text-red-700 mb-4 text-2xl">{error.message}</pre>
          <p
            onClick={resetBoundary}
            class="mt-4 inline-block rounded bg-[#7E5FF9] px-4 py-2 font-semibold text-white hover:bg-[#856af0] cursor-pointer"
          >
            Try Again
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
