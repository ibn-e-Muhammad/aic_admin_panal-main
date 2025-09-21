export default function FontTest() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-4xl font-bold">Font Test Page</h1>
      <p className="text-lg">This text should be using the Inter font.</p>
      <p className="text-sm font-light">Light weight (300)</p>
      <p className="text-sm font-normal">Normal weight (400)</p>
      <p className="text-sm font-medium">Medium weight (500)</p>
      <p className="text-sm font-semibold">Semibold weight (600)</p>
      <p className="text-sm font-bold">Bold weight (700)</p>

      <div className="mt-8 p-4 border border-gray-300 dark:border-gray-600 rounded">
        <h2 className="text-xl font-semibold mb-2">Form Elements Test</h2>
        <input
          type="text"
          placeholder="Input field should use Inter font"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
        />
        <textarea
          placeholder="Textarea should use Inter font"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
          rows={3}
        />
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2">
          <option>Select should use Inter font</option>
          <option>Option 1</option>
        </select>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
          Button should use Inter font
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Check browser DevTools to verify font-family is: Inter, ui-sans-serif,
        system-ui...
      </div>
    </div>
  );
}
