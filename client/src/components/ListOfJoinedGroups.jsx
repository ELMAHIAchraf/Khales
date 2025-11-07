import React from "react";

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
};

const ListOfJoinedGroups = ({ groups }) => {
  let userId = null;
  try {
    const userCookie = getCookie("user");
    if (userCookie) {
      const user = JSON.parse(userCookie);
      userId = user.id;
    }
  } catch (e) {}

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Groups You Joined</h2>
      {groups.length === 0 ? (
        <div className="text-gray-500">You have not joined any groups yet.</div>
      ) : (
        groups.map((group) => (
          <div key={group.groupId} className="mb-6 border rounded p-4 shadow">
            <div className="mb-2">
              <span className="font-semibold text-purple-700">{group.groupName}</span>
              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                Your role: {group.yourRole}
              </span>
            </div>
            <div>
              <span className="font-semibold">Members:</span>
              <ul className="ml-4 mt-1">
                {group.members.filter((member) => member.userId !== userId).length === 0 ? (
                  <li className="text-gray-500 italic">No other members in this group.</li>
                ) : (
                  group.members
                    .filter((member) => member.userId !== userId)
                    .map((member) => (
                      <li key={member.userId} className="flex items-center">
                        <span>{member.name}</span>
                        <span className="ml-2 text-xs text-gray-600">({member.role})</span>
                      </li>
                    ))
                )}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ListOfJoinedGroups;