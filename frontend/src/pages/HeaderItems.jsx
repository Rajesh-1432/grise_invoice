import api from "@/utils/api";
import React, { useEffect, useState } from "react";

const HeaderItems = () => {
  const [headerItems, setHeaderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHeaderItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/auth/getall-headeritems");
      setHeaderItems(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching header items:", err);
      setError("Failed to fetch header items");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeaderItems();
  }, []);

  if (loading)
    return <p className="text-center mt-4">Loading header items...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">{error}</p>;

  if (headerItems.length === 0) {
    return <p className="text-center mt-4">No header items found</p>;
  }

  // Get dynamic headers from first object and remove _id
  const headers = Object.keys(headerItems[0]).filter(
    (key) => key !== "_id" && key !== "__v"
  );
const formatHeader = (key) => {
  return key
    .replace(/([A-Z])/g, " $1") // insert spaces before uppercase letters
    .replace(/^./, (str) => str.toUpperCase()); // capitalize first letter
};


  return (
    <div className="p-2 h-full">
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
              {headers.map((key) => (
                <th
                  key={key}
                  className="px-2 py-2 border-b border-gray-200 text-left text-sm"
                >
                  {formatHeader(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {headerItems.map((item, index) => (
              <tr
                key={index}
                className={`text-gray-800 text-sm hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {headers.map((key) => (
                  <td key={key} className="px-2 py-2 border-b border-gray-200">
                    {item[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HeaderItems;
