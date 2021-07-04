/*
    Gives various functionality to projec cards, like saving it, liking it, etc.

    Precondition: The parent of this mixin needs to contain a post object named projectData
*/

import GraphQLService from "@/services/graphql.service";

const projectCard = {
    methods: {
        savePost(id) {
            if (!this.$store.getters.accessToken) {
                this.$router.push("/login");
            }

            GraphQLService.savePost(this.$store.getters.accessToken, id).then((savedPost) => {
                this.projectData.isSaved = savedPost.data.savePost.isSaved;

                this.$store.dispatch("updatePost",  {
                    id: id,
                    fieldsToUpdate: [{ field: "isSaved", newVal: savedPost.data.savePost.isSaved }],
                }); // update post in cache
            });
        },
        unsavePost(id) {
            GraphQLService.unSavePost(this.$store.getters.accessToken, id).then((unSavedPost) => {
                if (unSavedPost.data.unSavePost) {
                    this.projectData.isSaved = false;
                    this.$store.dispatch("updatePost", {
                        id: id,
                        fieldsToUpdate: [{ field: "isSaved", newVal: unSavedPost.data.unSavePost.isSaved }],
                    }); // update post in cache 
                }
            });
        },
        likePost(id) {
            if (!this.$store.getters.accessToken) {
                this.$router.push("/login");
            }

            GraphQLService.likePost(
                this.$store.getters.accessToken,
                id
            ).then((res) => {
                if (res.data.likePost) {
                    this.projectData.likeAmt = res.data.likePost.likeAmt;
                    this.projectData.isLiked = res.data.likePost.isLiked;

                    this.$store.dispatch("updatePost", {
                        id: id,
                        fieldsToUpdate: [{ field: "isLiked", newVal: res.data.likePost.isLiked }, { field: "likeAmt", newVal: res.data.likePost.likeAmt}]
                    }); // update post in cache
                }
            });
        },
        unlikePost(id) {
            GraphQLService.unlikePost(
                this.$store.getters.accessToken,
                id
            ).then((res) => {
                this.projectData.likeAmt = res.data.unlikePost.likeAmt;
                this.projectData.isLiked = res.data.unlikePost.isLiked;

                this.$store.dispatch("updatePost", {
                    id: id,
                    fieldsToUpdate: [{ field: "isLiked", newVal: res.data.unlikePost.isLiked }, { field: "likeAmt", newVal: res.data.unlikePost.likeAmt}]
                }); // update post in cache
            });
        }
    }
};

export default projectCard;