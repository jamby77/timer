interface FormErrorsProps {
  errors: string[];
}

export const FormErrors = ({ errors }: FormErrorsProps) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 rounded border border-red-200 bg-red-50 p-3">
      <h4 className="mb-1 text-sm font-medium text-red-800">Please fix the following errors:</h4>
      <ul className="list-inside list-disc text-sm text-red-700">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
};
