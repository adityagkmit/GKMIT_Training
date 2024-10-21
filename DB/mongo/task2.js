// 1. Find all movies that share at least one cast member with "Blacksmith Scene."
db.movies.find({
  cast: { 
    $in: db.movies.findOne({ title: "Blacksmith Scene" }, { cast: 1 }).cast // Get cast of "Blacksmith Scene"
  }
});

/*
Explanation:
- The query retrieves the `cast` from "Blacksmith Scene" and finds movies with at least one matching cast member.
*/

// 2. Find the top 5 movies with the highest IMDb ratings released before 1900.
db.movies.find(
  { year: { $lt: 1900 } }, // Filter movies released before 1900
  { title: 1, imdb: 1, year: 1 } // Return title, IMDb rating, and year
)
.sort({ "imdb.rating": -1 }) // Sort by IMDb rating (highest first)
.limit(5); // Limit to top 5 results

/*
Explanation:
- Filters movies released before 1900, sorts them by IMDb rating, and returns the top 5.
*/

// 3. Find all movies directed by "William K.L. Dickson."
db.movies.find(
  { directors: "William K.L. Dickson" }, // Filter by director
  { title: 1, year: 1, "imdb.rating": 1 } // Return title, year, and IMDb rating
);

/*
Explanation:
- Retrieves all movies directed by William K.L. Dickson, showing title, release year, and IMDb rating.
*/

// 4. Find the top 3 directors with the most movies in the "Short" genre.
db.movies.aggregate([
  { $match: { genres: "Short" } }, // Filter "Short" genre movies
  { $unwind: "$directors" }, // Unwind directors array
  { $group: { _id: "$directors", movieCount: { $sum: 1 } } }, // Count movies per director
  { $sort: { movieCount: -1 } }, // Sort by movie count (highest first)
  { $limit: 3 }, // Limit to top 3 directors
  { $project: { director: "$_id", movieCount: 1, _id: 0 } } // Return director name and movie count
]);

/*
Explanation:
- Aggregates to find the top 3 directors based on the number of movies in the "Short" genre.
*/

// 5. Find movies where the number of viewer reviews has increased by at least 10% over the past year.
db.movies.find({
  $expr: {
    $gte: [
      { 
        $divide: [
          { $subtract: ["$tomatoes.viewer.numReviews", 100] }, // Calculate increase, Harcoded the value because data is not available
          100
        ] 
      },
      0.1 // Check if increase is at least 10%
    ]
  }
}, { title: 1, "tomatoes.viewer.numReviews": 1 });

/*
Explanation:
- Checks for movies with at least a 10% increase in viewer reviews compared to the previous count.
*/


// 6 aggregation query to find the pair of actors who have appeared together in the most number of movies. Return their names and the number of movies they've co-starred in.
db.movies.aggregate([    
    {
    $match: {
      "cast": {
      $exists: true
      }

    }
    },

    {
      $project: {
        castPairs: {
          $reduce: {
            input: { $range: [0, { $subtract: [{ $size: "$cast" }, 1] }] },
            initialValue: [],
            in: {
              $concatArrays: [
                "$$value",
                {
                  $map: {
                    input: { $slice: ["$cast", { $add: ["$$this", 1] }, { $size: "$cast" }] },
                    as: "pairActor",
                    in: [{ $arrayElemAt: ["$cast", "$$this"] }, "$$pairActor"]
                  }
                }
              ]
            }
          }
        }
      }
    },
    {
      $unwind: "$castPairs"
    },
    {
      $project: {
        actorPair: {
          $let: {
            vars: {
              first: { $arrayElemAt: ["$castPairs", 0] },
              second: { $arrayElemAt: ["$castPairs", 1] }
            },
            in: {
              $cond: { if: { $lt: ["$$first", "$$second"] }, then: ["$$first", "$$second"], else: ["$$second", "$$first"] }
            }
          }
        }
      }
    },
    {
      $group: {
        _id: "$actorPair",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ])
