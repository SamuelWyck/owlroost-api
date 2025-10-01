class PaginationManger {
    postTakeNum = 21;
    commentTakeNum = 41;
    userTakeNum = 21;


    calcPostSkip(pageNum) {
        return (this.postTakeNum - 1) * pageNum;
    };


    calcCommentSkip(pageNum) {
        return (this.commentTakeNum - 1) * pageNum;
    };


    calcUserSKip(pageNum) {
        return (this.userTakeNum - 1) * pageNum;
    };
};



module.exports = new PaginationManger();