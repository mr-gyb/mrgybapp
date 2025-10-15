import React, { useState } from "react";
// If you’re logged in + want to wire Firestore later, you can import your auth/db here.
// import { db } from "../lib/firebase";
// import { doc, setDoc } from "firebase/firestore";

const BRAND_BLUE = "#11335d";
const BRAND_GOLD = "#E3C472";

type CommunityUser = {
  id: string;
  name: string;
  businessName: string;
  industry: string;
  photoURL?: string;
};

// TEMP mock data — replace with Firestore query when ready
const MOCK_USERS: CommunityUser[] = [
  { id: "u1", name: "Ava Martinez", businessName: "North Shore Media", industry: "Marketing" },
  { id: "u2", name: "Liam Chen", businessName: "Chen Consulting", industry: "Consulting" },
  { id: "u3", name: "Maya Patel", businessName: "Patel Wellness", industry: "Health & Wellness" },
  { id: "u4", name: "Noah Johnson", businessName: "Summit Legal", industry: "Legal" },
  { id: "u5", name: "Zoe Kim", businessName: "Pixel Forge", industry: "Design" },
  { id: "u6", name: "Ethan Wright", businessName: "Wright Capital", industry: "Finance" },
];

const CommunityTab: React.FC = () => {
  const [users] = useState<CommunityUser[]>(MOCK_USERS);
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");

  const filtered = users.filter((u) => {
    const matchQ =
      !query ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.businessName.toLowerCase().includes(query.toLowerCase());
    const matchI = !industry || u.industry === industry;
    return matchQ && matchI;
  });

  const handleAdd = (user: CommunityUser) => {
    // TODO (when Firebase is ready):
    // const me = auth.currentUser?.uid; if (!me) return alert("Please log in.");
    // await setDoc(doc(db, "users", me, "connections", user.id), {
    //   userId: user.id, name: user.name, businessName: user.businessName, industry: user.industry, createdAt: Date.now()
    // });
    alert(`Added ${user.name} to your network (demo)`);
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0b1430]">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-5 pt-10 pb-6">
        <h1
          className="text-3xl sm:text-4xl font-bold"
          style={{ color: BRAND_BLUE }}
        >
          Expand Your Network
        </h1>

        {/* Controls */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <input
            className="w-full sm:w-1/2 rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2"
            placeholder="Search by name or business…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="w-full sm:w-56 rounded-md border border-gray-300 px-3 py-2"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="">All industries</option>
            <option>Marketing</option>
            <option>Consulting</option>
            <option>Health & Wellness</option>
            <option>Legal</option>
            <option>Design</option>
            <option>Finance</option>
          </select>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-5 pb-16">
        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="bg-white dark:bg-[#0f1b44] rounded-xl border p-5 flex flex-col gap-4 shadow-sm"
              style={{ borderColor: BRAND_GOLD, borderWidth: "2px" }}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {u.photoURL ? (
                    <img src={u.photoURL} alt={u.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm text-gray-500">IMG</span>
                  )}
                </div>
                <div>
                  <div className="text-lg font-semibold" style={{ color: BRAND_BLUE }}>
                    {u.name}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">{u.businessName}</div>
                  <div className="text-sm text-gray-500">{u.industry}</div>
                </div>
              </div>

              <button
                onClick={() => handleAdd(u)}
                className="self-start rounded-lg px-4 py-2 font-medium transition"
                style={{
                  color: BRAND_BLUE,
                  borderColor: BRAND_GOLD,
                  borderWidth: "2px",
                  background: "transparent",
                }}
              >
                Add
              </button>
            </div>
          ))}
        </div>

        {/* Next-section placeholder like in Canva */}
        <div className="mt-12 border-t pt-8">
          <h2
            className="text-xl sm:text-2xl font-semibold"
            style={{ color: BRAND_BLUE }}
          >
            Recommended Networking Groups
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            This is where your suggested alternative networking groups should be displayed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunityTab;
