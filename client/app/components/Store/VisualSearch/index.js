import React, { Component } from 'react';
import axios from 'axios';
import { API_URL } from '../../../constants';

class VisualSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isSearching: false,
      results: [],
      previewUrl: null,
      error: null
    };
    this.fileInputRef = React.createRef();
  }

  toggleModal() {
    this.setState({
      isOpen: !this.state.isOpen,
      results: [],
      previewUrl: null,
      error: null
    });
  }

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    this.setState({ previewUrl: previewUrl, results: [], error: null });
    this.searchByImage(file);
  }

  searchByImage(file) {
    this.setState({ isSearching: true, error: null });

    const formData = new FormData();
    formData.append('image', file);

    axios
      .post(API_URL + '/product/visual-search', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })
      .then(function (response) {
        var products = response.data.products || [];
        // Sort by confidence: highest match first
        products.sort(function (a, b) {
          return parseFloat(b.confidence || 0) - parseFloat(a.confidence || 0);
        });
        this.setState({
          results: products,
          isSearching: false
        });
      }.bind(this))
      .catch(function () {
        this.setState({
          error: 'Search failed. Please try again.',
          isSearching: false
        });
      }.bind(this));
  }

  getMatchColor(confidence) {
    var val = parseFloat(confidence || 0);
    if (val >= 80) return 'vs-match-high';
    if (val >= 50) return 'vs-match-medium';
    return 'vs-match-low';
  }

  render() {
    var isOpen = this.state.isOpen;
    var isSearching = this.state.isSearching;
    var results = this.state.results;
    var previewUrl = this.state.previewUrl;
    var error = this.state.error;
    var history = this.props.history;

    return (
      <div className='visual-search'>
        <button
          className='visual-search-btn'
          onClick={() => this.toggleModal()}
          title='Search by Image'
        >
          <i className='fa fa-camera' />
        </button>

        {isOpen && (
          <div className='visual-search-overlay' onClick={() => this.toggleModal()}>
            <div className='visual-search-modal' onClick={function (e) { e.stopPropagation(); }}>

              <div className='vs-header'>
                <div className='vs-header-left'>
                  <i className='fa fa-search vs-header-icon' />
                  <div>
                    <h4>Visual Search</h4>
                    <p className='vs-header-sub'>Find products by uploading an image</p>
                  </div>
                </div>
                <button className='vs-close' onClick={() => this.toggleModal()}>
                  <i className='fa fa-times' />
                </button>
              </div>

              <div className='vs-body'>
                <div className='vs-upload-area'>
                  <input
                    ref={this.fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={(e) => this.handleFileSelect(e)}
                    style={{ display: 'none' }}
                  />
                  <button
                    className='vs-upload-btn'
                    onClick={() => this.fileInputRef.current.click()}
                  >
                    <div className='vs-upload-icon-wrap'>
                      <i className='fa fa-camera' />
                    </div>
                    <span className='vs-upload-text'>Click to upload a product image</span>
                    <span className='vs-upload-hint'>JPG, PNG supported</span>
                  </button>
                </div>

                {previewUrl && (
                  <div className='vs-preview'>
                    <p className='vs-preview-label'>Your Image</p>
                    <img src={previewUrl} alt='Query' />
                  </div>
                )}

                {isSearching && (
                  <div className='vs-loading'>
                    <div className='vs-loading-spinner'>
                      <i className='fa fa-spinner fa-spin' />
                    </div>
                    <p className='vs-loading-text'>Analyzing image with AI...</p>
                    <p className='vs-loading-hint'>Finding visually similar products</p>
                  </div>
                )}

                {error && (
                  <div className='vs-error'>
                    <i className='fa fa-exclamation-circle' />
                    <span>{error}</span>
                  </div>
                )}

                {results.length > 0 && (
                  <div className='vs-results'>
                    <div className='vs-results-header'>
                      <h5><i className='fa fa-check-circle' /> {results.length} Products Found</h5>
                      <span className='vs-results-sort'>Sorted by best match</span>
                    </div>
                    <div className='vs-list'>
                      {results.map(function (product, index) {
                        return (
                          <div
                            key={product._id}
                            className='vs-item'
                            onClick={function () {
                              this.toggleModal();
                              history.push('/product/' + product.slug);
                            }.bind(this)}
                          >
                            <div className='vs-item-rank'>#{index + 1}</div>
                            <div className='vs-item-image'>
                              <img
                                src={product.imageUrl || '/images/placeholder-image.png'}
                                alt={product.name}
                              />
                            </div>
                            <div className='vs-item-details'>
                              <h6 className='vs-item-name'>{product.name}</h6>
                              <p className='vs-item-price'>&#8377;{product.price}</p>
                              {product.brand && product.brand.name && (
                                <span className='vs-item-brand'>{product.brand.name}</span>
                              )}
                            </div>
                            <div className='vs-item-match'>
                              <div className={'vs-match-badge ' + this.getMatchColor(product.confidence)}>
                                {product.confidence}%
                              </div>
                              <span className='vs-match-label'>match</span>
                            </div>
                          </div>
                        );
                      }.bind(this))}
                    </div>
                  </div>
                )}

                {!isSearching && results.length === 0 && previewUrl && !error && (
                  <div className='vs-no-results'>
                    <i className='fa fa-search' />
                    <p>No matching products found</p>
                    <span>Try uploading a different image</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default VisualSearch;
