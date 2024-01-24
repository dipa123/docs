define([
    "jquery"
], function($){
    return function (config) {
    $('#search').on('keyup', function() {
        $('.autosuggestions-wrapper').show();
      var LiveSearchConfigData =  config;
      var SearchInput = this.value;
      if(SearchInput.length >= LiveSearchConfigData.minQueryLength && LiveSearchConfigData != null) {
      fetch('https://commerce.adobe.io/search/graphql', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Magento-Environment-Id": LiveSearchConfigData.environmentId,
            "Magento-Store-Code" : LiveSearchConfigData.storeCode,
            "Magento-Store-View-Code": LiveSearchConfigData.storeViewCode,
            "Magento-Website-Code" : LiveSearchConfigData.websiteCode,
            "X-Api-Key" : "search_gql"
          },
          body: JSON.stringify({
            query: `query quickSearch(
              $phrase: String!
              $pageSize: Int = 5
              $currentPage: Int = 1
              $filter: [SearchClauseInput!]
              $sort: [ProductSearchSortInput!]
              $context: QueryContextInput
          ) {
              productSearch(
                  phrase: $phrase
                  page_size: $pageSize
                  current_page: $currentPage
                  filter: $filter
                  sort: $sort
                  context: $context
              ){
                  items {
                      ...Product
                  }
                  page_info {
                      current_page
                      page_size
                      total_pages
                  }
              }
          }

          fragment Product on ProductSearchItem {
              product {
                  sku
                  name
                  canonical_url
                  image {
                      url
                  }
                  short_description {
                    html
                  }
              }
          }`,
        variables: { "phrase": SearchInput, "page_size": LiveSearchConfigData.pageSize},
          })
        })
        .then(res => res.json())
        .then(function (res) {
            $('.autosuggestions-wrapper').html('');
            var response = res.data.productSearch.items;
            var html = '<div class="autocomplete-suggestions position-absolute h-100 w-100" style="z-index: 9999;">';
            $.each(response, function(key,val) {
                var item = val.product;
                let short_description = item.short_description ? item.short_description.html.replace('""', '') : "";
                html += `
                    <div class="autocomplete-suggestion" data-index="${key}">
                        <a href='${item.canonical_url}' class="columns d-flex flex-row justify-content-between" style="display:flex;text-decoration: none;">
                            <div class="suggestion-left float-left">
                                <img class="img-responsive" src='${item.image ? item.image.url : LiveSearchConfigData.baseImage}' alt='${item.name}'/>
                            </div>
                            <div class="suggestion-right">
                                <div class="product-line product-name">
                                    ${item.name}
                                </div>
                                <div class="product-des">
                                    <p class="short-des">${short_description.length > 100 ? short_description.substring(0, 100).concat('...') : short_description}</p>
                                </div>
                            </div>
                        </a>
                    </div>
                `;
            });
            html += `<div id="static-search" class="search-static">
                    <div class="control-list">
                        <div class="result-navigation">
                            <div class="control-icon">
                                <div class="icon-arrow-up"></div>
                                <div class="icon-arrow-down"></div>
                            </div>
                            <span class="control-text">
                                Navigate result list
                            </span>
                            <div class="enter-icon"></div>
                            <div class="select-text">
                                Select
                            </div>
                        </div>
                    </div>
                    <div class="search-close">
                        <div class="close-icon"></div>
                        <span class="close-text">
                            Close
                        </span>
                    </div>
                </div>`;
            html += '</div>';
            $(html).appendTo('.autosuggestions-wrapper');
        }).catch(function (error) {
            console.log(error)
        })
    }else{
        $('.autosuggestions-wrapper').html('');
    }
    });
    $(document).on("click", (e) => {
        if ($(e.target).closest(".autosuggestions-wrapper").length === 0 && e.target.id != 'search') {
            $(".autosuggestions-wrapper").hide();
        }
    });
}
});
