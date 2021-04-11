import Posts from "../../../components/post/post.model.js";
import User from "../../../components/user/user.model.js";
import AddDynamicData from "../misc/addDynamicData.js";
import mongoose from "mongoose";

// userToFilter is the username of the author you want to search based on. Example -> search only the posts of this username
export default async function getPostByPartial(partial_name, filter, userToFilter, sortingType, lastPostId, lastUniqueField, loadAmt, requester_token) {
    let user;
    
    if (requester_token) {
        const jwtPayload = requester_token;

        if (!jwtPayload) throw new AuthenticationError("Unauthorized.");

        user = await User.findOne({ username: jwtPayload.username});
    } else if (filter === "myProjects" || filter === "saved") {
        // you need to requester token if you are querying with these filters
        throw new AuthenticationError("Unauthorized.");
    }
    
    // notes for when I pick this up: you can't run conditional queries in and or or chains because they will always evaluate to false (just dont use them)
    return new Promise((resolve) => {
        const regex = new RegExp(partial_name, "i");
        const lastPostIdQuery = lastPostId!=0 ? { _id: { $lt: lastPostId } } : {};
        //const lastUniqueFieldQuery = lastUniqueField!=-1 ? { likeAmt: { $lt: lastUniqueField } } : {};
        let postQuery = {}; // post query for the filter, like filtering out for a certain title or name
        
        try {
            // get a query for the post filter
            if (filter === "saved") {
                let userPosts = user.saved_posts;

                // for whatever reason to find by id, they need to wrapped in an ObjectType wrapper
                for (let i = 0; i < userPosts.length; i++) {
                    userPosts[i] = new mongoose.Types.ObjectId(userPosts[i]);
                } 

                postQuery = { _id: { $in: userPosts } };
            } else if (filter === "myProjects") {
                postQuery = { author: userToFilter };
            }

            // get posts given a sorting type
            if (sortingType === "Newest") {
                console.log(lastPostId);
                Posts.find({
                    $and: [
                        postQuery,
                        { title: regex },
                        lastPostIdQuery,
                    ]
                })
                .sort({ _id: -1 })
                .limit(loadAmt + 1)
                .then((posts) => {
                    if (user) {
                        resolve(AddDynamicData.addAll(posts, user));
                    }
                    resolve(posts);
                })
                .catch((err) => {
                    console.log(err);
                });
            } else if (sortingType === "Most Popular") {
                if (lastUniqueField != -1) {
                    console.log(postQuery);
                    Posts.find({
                        $or: [
                            {
                                //postQuery,
                                title: regex,
                                likeAmt: { $lt: lastUniqueField },
                            }, 
                            {
                                //postQuery,
                                title: regex,
                                likeAmt: lastUniqueField,
                                _id: { $lt: lastPostId },
                            }
                        ]
                    })
                    .sort({ likeAmt: -1, _id: -1 })
                    .limit(loadAmt+1)
                    .then((results) => {
                        console.log(results);
                        if (user) {
                            resolve(AddDynamicData.addAll(results, user));
                        }
                        resolve(results);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
                } else {
                    Posts.find({
                        $and: [
                            postQuery,
                            { title: regex }
                        ]
                    })
                    .sort({ likeAmt: -1, _id: -1 })
                    .limit(loadAmt+1)
                    .then((results) => {
                        if (user) {
                            resolve(AddDynamicData.addAll(results, user));
                        }
                        resolve(results);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
                }   
            }
        } catch (err) {
            throw new Error("There was a problem: " + err);
        }
        
        /* Old stinky poo poo query (leaving for ref)
        if (filter === "none") {
            Posts.find({ title: regex })
            .limit(loadAmt+1)
            .then((posts) => { 
                if (user) {
                    const finalPosts = AddDynamicData.addAll(posts, user);
                    resolve(finalPosts);
                }
                resolve(posts);
            })
            .catch((err) => {
                console.log(err);
            });
        } else {
            // search based on some filter
            try {
                let postQuery;
                if (lastPostId != -1) {
                    if (filter === "saved") {
                        // need to find the posts objects since they are not contained in the user db document
                        let userPosts = user.saved_posts;

                        // for whatever reason to find by id, they need to wrapped in an ObjectType wrapper
                        for (let i = 0; i < userPosts.length; i++) {
                            userPosts[i] = new mongoose.Types.ObjectId(userPosts[i]);
                        } 
                        postQuery = { _id: { $in: userPosts } };
                    } else if (filter === "myProjects") {
                        postQuery = { author: userToFilter };
                    }
                    if (sortingType == "Newest") {
                        // NEWEST POST SORT LOGIC
                        if (lastPostId != 0) {
                            Posts.find({
                                $and: [
                                    postQuery,
                                    { _id: { $lt: lastPostId } },
                                    { title: regex }
                                ]
                            })
                            .limit(loadAmt+1)
                            .sort({ _id: -1 })
                            .then((results) => {
                                if (user) {
                                    const finalPosts = AddDynamicData.addAll(results, user);
                                    resolve(finalPosts);
                                }
                                resolve(results);
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                        } else {
                            Posts.find({
                                $and: [
                                    postQuery,
                                    { title: regex }
                                ]
                            })
                            .sort({ _id: -1 })
                            .limit(loadAmt+1)
                            .then((results) => {
                                if (user) {
                                    const finalPosts = AddDynamicData.addAll(results, user);
                                    resolve(finalPosts);
                                }
                                resolve(results);
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                        }
                    } else if (sortingType == "Most Popular") {
                        // MOST POPULAR SORT LOGIC
                        if (lastPostId != 0 && lastUniqueField != -1) {
                            Posts.find({
                                $or: [
                                    {
                                        postQuery,
                                        likeAmt: { $lt: lastUniqueField }
                                    },
                                    {
                                        $and: [
                                            postQuery,
                                            { _id: { $lt: lastPostId } },
                                            { title: regex }
                                        ],
                                        likeAmt: { $lt: lastUniqueField }
                                    }
                                ]
                            })
                            .sort({ likeAmt: -1, _id: -1 })
                            .limit(loadAmt+1)
                            .then((results) => {
                                if (user) {
                                    const finalPosts = AddDynamicData.addAll(results, user);
                                    resolve(finalPosts);
                                }
                                resolve(results);
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                        }
                    }
                } else {
                    Posts.find({
                        $and: [
                            postQuery,
                            { title: regex }
                        ]
                    })
                    .limit(loadAmt+1)
                    .then((results) => {
                        if (user) {
                            const finalPosts = AddDynamicData.addAll(results, user);
                            resolve(finalPosts);
                        }
                        resolve(results);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
                }
            } catch (err) {
                throw new Error("There was a problem: " + err);
            }
        }
        */
    });
}