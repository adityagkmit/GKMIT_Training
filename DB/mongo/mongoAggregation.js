db.movies.aggregate([
	{
		$match: {
			"imdb.rating": {
				$gt: 5
			}
		}
	}
])



db.movies.aggregate([
	{
		$match: {
			"imdb.rating": {
				$gt: 5
			}
		}
	},{
		$addFields: {
			avg_ratings: {
				$avg: ["$imdb.rating", "$tomatoes.viewer.rating"]
			}
		}
	}
])



db.movies.aggregate([
	{
		$match: {
			"imdb.rating": {
				$gt: 5
			}
		}
	},{
		$addFields: {
			avg_ratings: {
				$avg: ["$imdb.rating", "$tomatoes.viewer.rating"]
			}
		}
	}, {
		$match: {
			"year": {
				$gte: 1910
			}
		}
	}, {
		$count: "title"
	}
])



db.movies.aggregate([
	{
		$match: {
			"imdb.rating": {
				$gt: 5
			}
		}
	},{
		$addFields: {
			avg_ratings: {
				$avg: ["$imdb.rating", "$tomatoes.viewer.rating"]
			}
		}
	}, {
		$match: {
			"year": {
				$gte: 1910
			}
		}
	}, {
		$unwind: {
			path: "$genres"
		}
	}, {
		$project: {
			rated: 1
		}
	}
])



db.movies.aggregate([
	{
		$match: {
			"imdb.rating": {
				$gt: 5
			}
		}
	},{
		$addFields: {
			avg_ratings: {
				$avg: ["$imdb.rating", "$tomatoes.viewer.rating"]
			}
		}
	}, {
		$match: {
			"year": {
				$gte: 1910
			}
		}
	}, {
		$group: {
			_id: "$year", 
			title: {
				$push: "$title"
			}, 
			count: {
				$sum: 1
			}
		}
	}
])



db.movies.aggregate([
	{
		$match: {
			"imdb.rating": {
				$gt: 5
			}
		}
	},{
		$addFields: {
			avg_ratings: {
				$avg: ["$imdb.rating", "$tomatoes.viewer.rating"]
			}
		}
	}, {
		$match: {
			"year": {
				$gte: 1910
			}
		}
	}, {
		$lookup: {
			from: "comments", 
			foreignField: "movies_id", 
			localField: "_id", 
			as: "comments"
		}
	}
])




db.movies.aggregate([
	{
		$match: {
			"imdb.rating": {
				$gt: 5
			}
		}
	},{
		$addFields: {
			avg_ratings: {
				$avg: ["$imdb.rating", "$tomatoes.viewer.rating"]
			}
		}
	}, {
		$match: {
			"year": {
				$gte: 1910
			}
		}
	}, {
		$facet: {
			"data": [{
				$skip: 10
			},{
				$limit: 10
			}],
			"count": [{
				$count: "title"
			}]
	}
}
])
