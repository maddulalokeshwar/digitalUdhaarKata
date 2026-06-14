export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  )
}