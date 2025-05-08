import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import defaultAvatar from "../../assets/Teachers-images/t-1.png"; // fallback avatar
import { UserContext } from "../../context/userContextApi";
import { Link } from "react-router-dom";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const { backendUrl, token } = useContext(UserContext);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get(`${backendUrl}api/users/get-teachers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("API Response:", res.data);

        if (Array.isArray(res.data)) {
          setTeachers(res.data);
          setFiltered(res.data);
        } else {
          console.warn("Unexpected response format:", res.data);
          setTeachers([]);
          setFiltered([]);
        }
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
        setTeachers([]);
        setFiltered([]);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    const filteredList = teachers.filter((teacher) =>
      `${teacher.firstName} ${teacher.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFiltered(filteredList);
  }, [search, teachers]);

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">
        Instructors ({filtered.length})
      </h2>
      <input
        type="text"
        placeholder="Search in your teachers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded-lg mb-4"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((teacher) => (
          <div key={teacher._id} className="bg-gray-100 p-4 rounded-lg text-center">
            <img
              src={teacher.image || defaultAvatar}
              alt={`${teacher.firstName} ${teacher.lastName}`}
              className="w-24 h-24 object-cover mx-auto rounded-full mb-4"
            />
            <p className="text-lg font-bold">
              {teacher.firstName} {teacher.lastName}
            </p>
            <p className="text-gray-600">{teacher.bio || "Instructor"}</p>
            <p className="text-gray-500 text-sm">Role: {teacher.role}</p>
            <p className="text-yellow-500 font-bold">⭐ {teacher.rating || "4.5"}</p>
            <div className="flex gap-2 justify-center">
              <button className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                Send Message
              </button>
              <Link
                to={`/teachers/${teacher._id}`}
                className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teachers;
