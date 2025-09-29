class PaginationManger {
    postTakeNum = 21;
    commentTakeNum = 3;


    calcPostSkip(pageNum) {
        return (this.postTakeNum - 1) * pageNum;
    };


    calcCommentSkip(pageNum) {
        return (this.commentTakeNum - 1) * pageNum;
    };
};



module.exports = new PaginationManger();