import React, { useEffect, useState } from "react";
import { watchIncomingRequests, watchSentRequests, acceptFriendRequest, declineFriendRequest, markIncomingSeen } from "../services/friends";
import { IncomingRequest, SentRequest } from "../types/friendships";
import { useAuth } from "../contexts/AuthContext";

export const FriendRequestsPanel: React.FC = () => {
  const { user } = useAuth();
  const uid = user?.uid;
  const [incoming, setIncoming] = useState<IncomingRequest[]>([]);
  const [sent, setSent] = useState<SentRequest[]>([]);
  const [tab, setTab] = useState<"incoming"|"sent">("incoming");

  useEffect(() => {
    if (!uid) return;
    const stop1 = watchIncomingRequests(uid, setIncoming);
    const stop2 = watchSentRequests(uid, setSent);
    return () => { stop1 && stop1(); stop2 && stop2(); };
  }, [uid]);

  useEffect(() => {
    if (tab === "incoming" && uid) markIncomingSeen(uid);
  }, [tab, uid]);

  const unseenCount = incoming.filter(r => !r.seen).length;

  if (!uid) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex space-x-1 mb-4">
        <button 
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === "incoming" 
              ? "bg-blue-500 text-white" 
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`} 
          onClick={() => setTab("incoming")}
        >
          Incoming ({unseenCount})
        </button>
        <button 
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === "sent" 
              ? "bg-blue-500 text-white" 
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`} 
          onClick={() => setTab("sent")}
        >
          Sent ({sent.length})
        </button>
      </div>

      {tab === "incoming" ? (
        incoming.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No incoming friend requests
          </div>
        ) : (
          <div className="space-y-3">
            {incoming.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{r.fromName}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{r.id}</div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => acceptFriendRequest(uid, r.fromUid)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => declineFriendRequest(uid, r.fromUid)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-3">
          {sent.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-4">
              No sent requests
            </div>
          ) : (
            sent.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{r.toName || r.toUid}</div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                    Pending
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FriendRequestsPanel;
