const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const axios = require('axios')
const redis = require('./config/redisConnection')
const APP_SERVICE_URL = process.env.APP_SERVICE_URL || 'http://localhost:4002'
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4001'

const typeDefs = `#graphql

  type User {
    id: ID
    username: String
    email: String
    password: String
    phoneNumber: String
    createdAt: String
    updatedAt: String
  }
  type Favorite {
    id: ID
    RecipeId: Int
    UserId: Int
    createdAt: String
    updatedAt: String
  }
  type Ingredient {
    id: ID
    name: String
    RecipeId: Int
    createdAt: String
    updatedAt: String
  }
  type Recipe {
    id: ID
    title: String
    image: String
    description: String
    videoUrl: String
    origin: Int
    portion: String
    cookingTime: Int
    UserId: Int
    createdAt: String
    updatedAt: String
  }

  type Step {
    id: ID
    instruction: String
    image: String
    RecipeId: Int
    createdAt: String
    updatedAt: String
  }
  type Reaction {
    id: ID
    instruction: String
    quantity: Int
    RecipeId: Int
    UserId: Int
    createdAt: String
    updatedAt: String
  }
  type Comment {
    id: ID
    message: String
    RecipeId: Int
    UserId: Int
    createdAt: String
    updatedAt: String
  }

  type Query {
    findUser: User
    findMovie(id : ID!): Movie //! baru sampe sini aku ke kamar mandi dulu
    findGenres: [Genre] 
    findUsers: [User]
    findUser(id : ID!): User
  }

  type Mutation{
    addMovie(
    title: String,
    slug: String,
    synopsis: String,
    trailerUrl: String,
    rating: Int,
    imgUrl: String,
    genreId: Int,
    casts: [CastInput],
    ): ResponseMessage,
    updateMovie(
    id: ID,
    title: String,
    slug: String,
    synopsis: String,
    trailerUrl: String,
    rating: Int,
    imgUrl: String,
    genreId: Int,
    casts: [CastInput],
    ): ResponseMessage,
    deleteMovie(
    id: ID
    ): ResponseMessage,
    addGenre(
    name: String,
    ): ResponseMessage,
    updateGenre(
    id: ID,
    name: String, 
    ): ResponseMessage,
    deleteGenre(
    id: ID
    ): ResponseMessage,
    addUser(
    username: String,
    email: String,
    password: String,
    phoneNumber: String,
    address: String,
    ): ResponseMessage,
    deleteUser(
    id: ID
    ): ResponseMessage,

  }
`;

const resolvers = {
  Query: {
    findMovies: async () => {
      try {
        const moviesCache = await redis.get('movies')
        if (moviesCache) {
          const movies = JSON.parse(moviesCache)
          return movies
        } else {
          const { data: Movies } = await axios.get(APP_SERVICE_URL + '/movies')
          await redis.set('movies', JSON.stringify(Movies))
          return Movies
        }
      } catch (error) {
        console.log(error);
      }
    },
    findMovie: async (_, args) => {
      try {
        const { id } = args
        const { data: Movie } = await axios.get(APP_SERVICE_URL + '/movies/' + id)
        const { data: User } = await axios.get(USER_SERVICE_URL + '/users/' + Movie.UserMongoId)
        Movie.User = User
        return Movie
      } catch (error) {
        console.log(error);
      }
    },
    findUsers: async () => {
      try {
        const usersCache = await redis.get('users')
        if (usersCache) {
          const users = JSON.parse(usersCache)
          return users
        } else {
          const { data: users } = await axios.get(USER_SERVICE_URL + '/users')
          await redis.set('users', JSON.stringify(users))
          return users
        }
      } catch (error) {
        console.log(error);
      }
    },
    findUser: async (_, args) => {
      try {
        const { id } = args
        const { data: users } = await axios.get(USER_SERVICE_URL + '/users/' + id)
        return users
      } catch (error) {
        console.log(error);
      }
    },
    findGenres: async () => {
      try {
        const genresCache = await redis.get('genres')
        if (genresCache) {
          const genres = JSON.parse(genresCache)
          return genres
        } else {
          const { data: genres } = await axios.get(APP_SERVICE_URL + '/genres')
          await redis.set('genres', JSON.stringify(genres))
          return genres
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
  Mutation: {
    addMovie: async (_, args) => {
      try {
        const {
          title,
          slug,
          synopsis,
          trailerUrl,
          rating,
          imgUrl,
          genreId,
          casts } = args
        const newMovie = {
          title,
          slug,
          synopsis,
          trailerUrl,
          rating,
          imgUrl,
          genreId,
          casts
        }
        const { data } = await axios({
          method: 'post',
          url: APP_SERVICE_URL + '/movies',
          data: newMovie
        })
        await redis.del('movies')
        return data
      } catch (err) {
        return (err);
      }
    },
    updateMovie: async (_, args) => {
      try {
        const {
          id,
          title,
          slug,
          synopsis,
          trailerUrl,
          rating,
          imgUrl,
          genreId,
          casts } = args
        const updatedMovie = {
          title,
          slug,
          synopsis,
          trailerUrl,
          rating,
          imgUrl,
          genreId,
          casts
        }
        const { data } = await axios({
          method: 'put',
          url: APP_SERVICE_URL + '/movies/' + id,
          data: updatedMovie
        })
        await redis.del('movies')
        return data
      } catch (err) {
        return (err);
      }
    },
    deleteMovie: async (_, args) => {
      try {
        const { id } = args
        const { data } = await axios({
          method: 'delete',
          url: APP_SERVICE_URL + '/movies/' + id
        })
        await redis.del('movies')
        return data
      } catch (err) {
        return (err);
      }
    },
    addGenre: async (_, args) => {
      try {
        const {
          name,
        } = args
        const newGenre = {
          name
        }

        const { data } = await axios({
          method: 'post',
          url: APP_SERVICE_URL + '/genres',
          data: newGenre
        })
        await redis.del('genres')
        return data
      } catch (err) {
        return (err);
      }
    },
    updateGenre: async (_, args) => {
      try {
        const {
          id,
          name } = args
        const updatedGenre = {
          name
        }
        const { data } = await axios({
          method: 'patch',
          url: APP_SERVICE_URL + '/genres/' + id,
          data: updatedGenre
        })
        await redis.del('genres')
        return data
      } catch (err) {
        return (err);
      }
    },
    deleteGenre: async (_, args) => {
      try {
        const { id } = args
        const { data } = await axios({
          method: 'delete',
          url: APP_SERVICE_URL + '/genres/' + id
        })
        await redis.del('genres')
        return data
      } catch (err) {
        return (err);
      }
    },
    addUser: async (_, args) => {
      try {
        const {
          username,
          email,
          password,
          phoneNumber,
          address,
        } = args
        const newUser = {
          username,
          email,
          password,
          phoneNumber,
          address,
        }
        const { data } = await axios({
          method: 'post',
          url: USER_SERVICE_URL + '/users',
          data: newUser
        })
        await redis.del('users')
        return data
      } catch (err) {
        return (err);
      }
    },
    deleteUser: async (_, args) => {
      try {
        const { id } = args
        const { data } = await axios({
          method: 'delete',
          url: USER_SERVICE_URL + '/users/' + id
        })
        await redis.del('users')
        return data
      } catch (err) {
        return (err);
      }
    }
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true
});


startStandaloneServer(server, {
  listen: { port: process.env.PORT || 4000 },
}).then(({ url }) => {
  console.log(`🚀  Server ready at: ${url}`);
}).catch(err => {
  console.log(err);
})
