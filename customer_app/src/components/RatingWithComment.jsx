import React, { useState } from 'react'
import { FaStar } from 'react-icons/fa'

function RatingWithComment({ rating, setRating, comment, setComment }) {
  const [hover, setHover] = useState(0)
  return (
    <>
      <div className="flex space-x-1 justify-center mb-4">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => setRating(starValue)}
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(0)}
              className="focus:outline-none">
              <FaStar
                className={`text-2xl cursor-pointer transition-colors duration-200 ${
                  starValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            </button>
          )
        })}
      </div>

      <textarea
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Leave a comment..."
        rows="4"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
    </>
  )
}

export default RatingWithComment
