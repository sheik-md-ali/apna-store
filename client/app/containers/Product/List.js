/*
 *
 * List
 *
 */

import React from 'react';

import { connect } from 'react-redux';
import axios from 'axios';

import actions from '../../actions';
import { API_URL, ROLES } from '../../constants';

import ProductList from '../../components/Manager/ProductList';
import SubPage from '../../components/Manager/SubPage';
import LoadingIndicator from '../../components/Common/LoadingIndicator';
import NotFound from '../../components/Common/NotFound';
import Button from '../../components/Common/Button';

class List extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      reindexing: false,
      reindexMessage: ''
    };
  }

  componentDidMount() {
    this.props.fetchProducts();
  }

  handleReindex() {
    this.setState({ reindexing: true, reindexMessage: '' });

    axios
      .post(API_URL + '/product/reindex-all')
      .then(function (response) {
        this.setState({
          reindexing: false,
          reindexMessage: response.data.message
        });
      }.bind(this))
      .catch(function () {
        this.setState({
          reindexing: false,
          reindexMessage: 'Reindex failed. Try again.'
        });
      }.bind(this));
  }

  render() {
    const { history, products, isLoading, user } = this.props;
    const { reindexing, reindexMessage } = this.state;

    return (
      <>
        <SubPage
          title='Products'
          actionTitle='Add'
          handleAction={() => history.push('/dashboard/product/add')}
        >
          {user && user.role === ROLES.Admin && (
            <div className='mb-3 d-flex align-items-center'>
              <Button
                text={reindexing ? 'Reindexing AI Search...' : 'Reindex AI Search'}
                variant='primary'
                disabled={reindexing}
                onClick={() => this.handleReindex()}
              />
              {reindexing && <i className='fa fa-spinner fa-spin ml-2' />}
              {reindexMessage && <span className='ml-2 text-success'>{reindexMessage}</span>}
            </div>
          )}
          {isLoading ? (
            <LoadingIndicator inline />
          ) : products.length > 0 ? (
            <ProductList products={products} />
          ) : (
            <NotFound message='No products found.' />
          )}
        </SubPage>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    products: state.product.products,
    isLoading: state.product.isLoading,
    user: state.account.user
  };
};

export default connect(mapStateToProps, actions)(List);
