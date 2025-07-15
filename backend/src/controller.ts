import { Request, Response, NextFunction } from "express";
import { ApiError } from "./ApiError";
import { SignInFormSchema, SignUpFormSchema } from "./UserZodSchema";
import prisma from "./lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { z } from "zod";
import OpenAI from "openai";

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { success, error } = SignUpFormSchema.safeParse(req.body);

        if (!success) {
            next(new ApiError(411, error.issues[0].message))
            return;
        }

        const { name, email, password } = req.body;

        const existedUser = await prisma.user.findFirst({ where: { email } });

        if (existedUser) {
            next(new ApiError(401, "User already exists"))
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (!hashedPassword) {
            next(new ApiError());
            return
        }

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }, select: { name: true, email: true }
        })


        if (!newUser) {
            next(new ApiError());
            return;
        }

        res.status(201).json({
            newUser,
            message: "User signedUp successfully!",
            success: true
        })
    } catch (error) {
        next(new ApiError())
    }
}

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { success, error } = SignInFormSchema.safeParse(req.body);

        if (!success) {
            next(new ApiError(411, error.issues[0].message))
            return;
        }

        const { email, password } = req.body;

        const checkUser = await prisma.user.findFirst({ where: { email } })

        if (!checkUser) {
            next(new ApiError(404, "No User found with given Email-Id"))
            return;
        }

        const isPasswordCorrect = await bcrypt.compare(password, checkUser.password);

        if (!isPasswordCorrect) {
            next(new ApiError(403, "Incorrect Password"));
            return;
        }

        const token = jwt.sign({ id: checkUser.id }, process.env.JWT_SECRET as string);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true
        });

        res.status(200).json({
            token,
            name: checkUser.name,
            email: checkUser.email,
            message: "User signedIn successfully",
            success: true
        })
    } catch (error) {
        next(new ApiError())
        return;
    }
}

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.userId;
        const user = await prisma.user.findUnique({ where: { id }, select: { name: true, email: true } })

        if (!user) {
            next(new ApiError(404, "No User found with given Id"));
            return;
        }

        res.status(200).json({
            user,
            message: "User details fetched successfully",
            success: true
        })
    } catch (error) {
        next(new ApiError());
        return;
    }
}

export const getRecommendedMovies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const zodObj = z.object({
            searchText: z.string().min(5, { message: "Too short text" }).max(50, { message: "Too long text" })
        })

        const { success, error } = zodObj.safeParse(req.body);

        if (!success) {
            next(new ApiError(411, error.issues[0].message))
            return;
        }

        const id = req.userId;
        const loggedInUser = await prisma.user.findUnique({ where: { id }, select: { email: true, name: true } });

        if (!loggedInUser) {
            next(new ApiError(404, "No User found"));
            return;
        }

        const openAI = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
        });
        const gptQuery = "Act as a movie recommendation system and suggest some movies for the query " + req.body.searchText + "only give me top 10 names that are comma seperated like the example ahead. Example: Don, Sholay, Phir Hera Feri, Kahani, Aajkal...";

        const results = await openAI.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: gptQuery }]
        })

        const data = results.choices[0].message.content;
        const movies = data?.split(",")

        const newMovies = movies?.map((movie) => {
            movie.trim();
            const words = movie.split(" ");

            let query = "";

            words.map((word: string, index: number) => {
                if (word.length > 0) query += word;
                if (word.length > 0 && index != words.length - 1) query += "%20";
            })

            return query;
        });

        res.status(200).json({
            recommendedMovies: newMovies,
            message: "Recommended movies fetched successfully",
            success: true
        })
        return;
    } catch (error) {
        next(new ApiError())
    }
}

// export const getSingleMovie = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const zodObj = z.object({
//             movieName: z.string()
//         })


//         const { success, error } = zodObj.safeParse(req.body);

//         if (!success) {
//             next(new ApiError(411, error.issues[0].message))
//             return;
//         }

//         const { movieName } = req.body;
//         const words = movieName.split(" ");
//         let finalQuery = "";

//         words.map((word: string, index: number) => {
//             finalQuery += word;

//             if (index < word.length - 1) finalQuery += "%20";
//         })

//         const movieDetails = await axios.get(`https://api.themoviedb.org/3/search/movie?query=${finalQuery}`, {
//             headers: {
//                 Authorization: process.env.API_KEY_TOKEN
//             }
//         })

//         if (!movieDetails) {
//             next(new ApiError(403, "TMDB API not working on JIO"));
//             return;
//         }

//         res.status(200).json({
//             movieDetails,
//             message: "Movie details fetched successfully!",
//             success: true
//         })
//         return
//     } catch (error) {
//         next(new ApiError());
//         return;
//     }
// }

interface movieProps {
    id: number,
    poster_path: string;
    original_title: string;
    category: string;
    name: string;
}
export const addMovies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { movies, category }: { movies: movieProps[], category: string } = req.body

        const promisifiedArray = movies.map(async (movie) => {

            const alreadyAddedMovie = await prisma.movie.findUnique({ where: { id: movie.id } });

            if (alreadyAddedMovie) {
                alreadyAddedMovie.category.push(category);

                const updatedMovie = await prisma.movie.update({ where: { id: movie.id }, data: { category: alreadyAddedMovie.category } });
                return updatedMovie;
            } else {
                const res = await prisma.movie.create({
                    data: {
                        id: movie.id,
                        title: movie.original_title,
                        category: [category],
                        posterPath: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    }
                })
            }
        })

        const addedMovies = await Promise.all(promisifiedArray);

        res.status(200).json({
            addedMovies,
            message: "Given movies added successfully!",
            success: true
        })
    } catch (error) {
        next(new ApiError());
        return;
    }
}

export const getCollectionOfMovies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { categoryName } = req.query as any;

        const userId = req.userId;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            next(new ApiError(404, "No User found"))
            return;
        }

        let filteredMovies = [] as any[];

        const allMovies = await prisma.movie.findMany();

        allMovies.map((movie) => {
            movie.category.map((category) => {
                if (category.toLowerCase().includes(categoryName.toLowerCase()))
                    filteredMovies.push(movie);
            })
        })

        res.status(200).json({
            noOfMovies: filteredMovies.length,
            filteredMovies,
            message: "Movies filtered successfully!",
            sucess: true
        })
    } catch (error) {
        next(new ApiError());
        return;
    }
}