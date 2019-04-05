class Pagination{


        constructor(pageUrl, totalCount, page, perPage){
            this.page = page;
            this.perPage = perPage;
            this.pageUrl = pageUrl;
            this.totalCount = totalCount;
        }

        getOffset(){
            let offset = (this.page - 1) * this.perPage;
            return offset;
        }

        getTotalPages(){
            let totalPages = Math.ceil(this.totalCount / this.perPage);
            return totalPages;
        }

        hasNextPage(){
                return this.page < this.getTotalPages();
        }

        hasPreviousPage(){
                return this.page > 1;
        }

        generateLinkHeader(){
            


        }

        generatePaginationObject(){

            let paginationObject = {
                totalPages: this.getTotalPages(),
                perPage: this.perPage,
                currentPage: this.page,
                ...(this.hasPreviousPage() && {previousPage: this.page - 1}),
                ...(this.hasNextPage() && {nextPage: this.page + 1}),

            };

            return paginationObject;
        }


}


module.exports = Pagination;