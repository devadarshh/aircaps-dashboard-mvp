export const getToneColor = (tone?: string) => {
  switch (tone?.toLowerCase()) {
    case "constructive":
    case "collaborative":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
    case "inquisitive":
    case "curious":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
    case "empathetic":
    case "personal":
      return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200";
    case "casual":
    case "banter":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200";
    case "tense":
    case "conflict":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
    case "instructional":
    case "educational":
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
    case "transactional":
      return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
  }
};
