import { Link } from "react-router";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img 
              src={friend.profilePic || `https://avatar.iran.liara.run/public/boy?username=${friend.fullName}`} 
              alt={friend.fullName || "User"} 
              onError={(e) => { e.target.src = "https://avatar.iran.liara.run/public/boy"; }}
            />
          </div>
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>

        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full mt-2">
          Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;
