const state = {
    posts: [], // array of objects (containing filter, queryType, and posts)
    fullPosts: [], // array of post ids
};

const getters = {
    // get only the posts in memory based on queryType and filter (returns null if they arent in memory)
    // if the posts are in memory return an object with { posts: <all the posts>, fetchedAll: <were all posts fetched?> }
    getPosts: (state) => (filter, queryType, authorAffiliation) => {
        for (let i = 0; i < state.posts.length; i++) {
            if (state.posts[i].filter === filter && state.posts[i].queryType === queryType && state.posts[i].authorAffiliation === authorAffiliation) {
                return {
                    fetchedAll: state.posts[i].fetchedAll,
                    posts: state.posts[i].posts
                };
            }
        }
        return null;
    },
    // returns null if the full post is not in the cache
    getFullPost: (state) => (id) => {
        for (let i = 0; i < state.fullPosts.length; i++) {
            if (state.fullPosts[i].id === id) {
                return state.fullPosts[i];
            }
        }
    },
};

const mutations = {
    // will update the posts if the entry already exists
    addPostsToCache(state, payload) {
        //console.log(filter, queryType, posts);
        for (let i = 0; i < state.posts.length; i++) {
            if (state.posts[i].filter === payload.filter && state.posts[i].queryType === payload.queryType && state.posts[i].authorAffiliation === payload.authorAffiliation) {
                state.posts[i].posts = payload.posts;
                state.posts[i].fetchedAll = payload.fetchedAll;
                return; // break out of function if this is true
            }
        }

        // if the entry is not already in memory, add it
        state.posts.push({
            filter: payload.filter,
            queryType: payload.queryType,
            fetchedAll: payload.fetchedAll,
            authorAffiliation: payload.authorAffiliation,
            posts: payload.posts,
        });
    },
    updatePostInCache(state, payload) {
        for (let i = 0; i < state.posts.length; i++) {
            for (let j = 0; j < state.posts[i].posts.length; j++) {
                if (state.posts[i].posts[j].id === payload.id) {
                    for (let q = 0; q < payload.fieldsToUpdate.length; q++) {
                        state.posts[i].posts[j][payload.fieldsToUpdate[q].field] = payload.fieldsToUpdate[q].newVal;
                    }
                    break;
                }
            }
        }
    },
    cacheEntirePostInCache(state, postObj) {
        let alreadyCached = false;

        for (let i = 0 ; i < state.fullPosts.length; i++) {
            if (state.fullPosts[i].id === postObj.id) {
                alreadyCached = true;
                break;
            }
        }

        if (!alreadyCached) {
            state.fullPosts.push(postObj);
        }
    },
};

const actions = {
    addPosts({ commit }, payload) {
        commit("addPostsToCache", payload);
    },
    updatePost({ commit }, payload) {
        commit("updatePostInCache", payload);
    },
    cacheFullPost({ commit }, postObj) {
        commit("cacheEntirePostInCache", postObj);
    },
};

export default {
    state,
    getters,
    mutations,
    actions,
};
