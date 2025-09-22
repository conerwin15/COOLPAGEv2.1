import React from 'react';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 font-bold text-lg border-b">Dashboard</div>
        <ul className="p-4 space-y-3 text-gray-700">
          <li className="flex items-center gap-2 text-blue-600 font-semibold">
            👥 Overview
          </li>
          <li className="flex items-center gap-2">
            👁 Views
          </li>
          <li className="flex items-center gap-2">
            👥 Traffic
          </li>
          <li className="flex items-center gap-2">
            🎯 Geo
          </li>
          <li className="flex items-center gap-2">
            💎 Orders
          </li>
          <li className="flex items-center gap-2">
            🔔 News
          </li>
          <li className="flex items-center gap-2">
            🏛 General
          </li>
          <li className="flex items-center gap-2">
            🔄 History
          </li>
          <li className="flex items-center gap-2">
            ⚙ Settings
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="text-xl font-bold mb-6">My Dashboard</div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-500 text-white p-4 rounded shadow">
            <div className="text-3xl">52</div>
            <div>Messages</div>
          </div>
          <div className="bg-blue-500 text-white p-4 rounded shadow">
            <div className="text-3xl">99</div>
            <div>Views</div>
          </div>
          <div className="bg-teal-600 text-white p-4 rounded shadow">
            <div className="text-3xl">23</div>
            <div>Shares</div>
          </div>
          <div className="bg-orange-400 text-white p-4 rounded shadow">
            <div className="text-3xl">50</div>
            <div>Users</div>
          </div>
        </div>

        {/* Regions & Feeds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold mb-2">Regions</div>
            <div className="bg-white shadow rounded p-4 h-64 flex items-center justify-center">
              <span className="text-gray-400">[Map Placeholder]</span>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Feeds</div>
            <div className="bg-white shadow rounded divide-y">
              {[
                ['👤', 'New record, over 90 views.', '10 mins'],
                ['🚨', 'Database error.', '15 mins'],
                ['👥', 'New record, over 40 users.', '17 mins'],
                ['💬', 'New comments.', '25 mins'],
                ['💳', 'Check transactions.', '28 mins'],
                ['🖥', 'CPU overload.', '35 mins'],
              ].map(([icon, text, time], idx) => (
                <div key={idx} className="flex justify-between items-center px-4 py-2">
                  <span className="flex gap-2 items-center">{icon} {text}</span>
                  <span className="text-sm text-gray-500">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;