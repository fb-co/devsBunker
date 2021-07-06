import Posts from "../../../components/post/post.model.js";

export default async function getUserPost(postId, commentOffSet, commentIncrement) {
    return new Promise((resolve, reject) => {
        Posts.findOne({ _id: postId, enabled: true })
            .populate({
                path: 'comments',
                options: {
                    skip: commentOffSet,
                    limit: commentIncrement + 1,
                }
            })
            .exec()
            .then((post) => {
                if (post) {
                    resolve(post);
                } else {
                    reject(new Error("Unabled to find post"));
                }
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });
}
