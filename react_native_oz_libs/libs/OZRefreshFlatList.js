import React, {
    Component,
} from 'react'
import {
    FlatList,
    View,
    StyleSheet,
    ActivityIndicator,
    Text
} from 'react-native'
import PropTypes from 'prop-types';
import SizeUtil from "./SizeUtil";

const delayTime = 1000;
export const FlatListState = {
    NoRefresh: 0,
    Refreshing: 1,
    Both: 2,
}

export default class OZRefreshFlatList extends Component {
    static propTypes = {
        refreshing:PropTypes.bool,
        loadMore: PropTypes.bool,
        refreshState: PropTypes.number,
        onEndReached: PropTypes.func,
        onRefresh: PropTypes.func
    };
    
    state = {
        listHeight: 0,
    };
    
    constructor(props) {
        super(props);
        this.state = {
            noMoreData: false,
            empty: true,
        };
    }
    
    componentWillUnmount() {
        //清理定时器
        this.refreshTimer && clearTimeout(this.refreshTimer);
        this.loadMoreTimer && clearTimeout(this.loadMoreTimer);
    }
    
    render() {
        let {ListEmptyComponent, ItemSeparatorComponent} = this.props;
        let emptyContent = null;
        let separatorComponent = null;
        
        //设置无数据占位控件
        if (ListEmptyComponent) {
            emptyContent = React.isValidElement(ListEmptyComponent) ? ListEmptyComponent : <ListEmptyComponent/>
        } else {
            emptyContent = <Text style={{fontSize: 17, color: '#666666'}}>暂无数据</Text>;
        }
        
        //设置分割线控件
        if (ItemSeparatorComponent) {
            separatorComponent = React.isValidElement(ItemSeparatorComponent) ? ItemSeparatorComponent :
                <ItemSeparatorComponent/>
        } else {
            separatorComponent = <View style={{height: 1, backgroundColor: '#D6D6D6'}}/>;
        }
        
        return (
            <FlatList
                {...this.props}
                onLayout={(e) => {
                    let height = e.nativeEvent.layout.height;
                    if (this.state.listHeight < height) {
                        this.setState({listHeight: height})
                    }
                }}
                ListFooterComponent={() => this.renderFooter()}
                onRefresh={() => this.onRefresh()}
                onEndReached={() => this.onEndReached()}
                refreshing={this.props.refreshing}
                onEndReachedThreshold={this.props.onEndReachedThreshold || 0.1}
                ItemSeparatorComponent={() => separatorComponent}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => <View
                    style={{
                        height: SizeUtil.screenH(true, true),
                        width: SizeUtil.screenW(),
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>{emptyContent}</View>}
            />
        );
    }
    
    renderFooter = (value = null) => {
        let footer = null;
        if (!this.props.refreshing && this.props.refreshState === FlatListState.Both) {
            let loadMoreFooter = (
                <View style={styles.footerStyle}>
                    <ActivityIndicator size="small" color="#888888"/>
                    <Text style={styles.footerText}>数据加载中…</Text>
                </View>
            );
            
            let noMoreDataFooter = (
                <View style={styles.footerStyle}>
                    <Text style={styles.footerText}>暂无更多数据</Text>
                </View>
            );
            
            footer = (
                this.state.noMoreData === true ? noMoreDataFooter : loadMoreFooter
            );
            
            if (this.state.empty) {
                footer = null;
            }
        }
        return footer;
    }
    
    onRefresh = () => {
        if (this.props.refreshState === FlatListState.Refreshing || this.props.refreshState === FlatListState.Both) {
            if (!this.props.refreshing) {
                this.refreshTimer = setTimeout(() => {
                    this.props.onRefresh && this.props.onRefresh();
                }, delayTime);
            }
        }
    }
    
    onEndReached = () => {
        console.log('onEndReached');
        if (this.props.refreshState === FlatListState.Refreshing ||
            this.props.refreshState === FlatListState.NoRefresh) {
            return;
        }
        
        //pageSize未设置
        if (!this.props.pageSize) {
            console.error('pageSize未设置');
            return;
        }
        
        //length未设置
        if (this.props.length === null) {
            console.error('length未设置');
            return;
        }
        
        
        if (this.props.length) {
            if ((this.props.length % this.props.pageSize !== 0) || (this.props.length / (this.props.page - 1) === this.props.pageSize)) {
                //length长度和pageSize的余数不为0 例如： pageSize为10，一共有22个数据，页数为3，多了2个数据
                //length长度除以page页数-1等于pageSize 例如 30个数据，4页，第四页获取的数据是0，3页
                console.log('no more data');
                this.setState({
                    noMoreData: true,
                    empty: false,
                });
                return;
            }
        } else {
            //length 为0
            console.log('empty');
            this.setState({
                empty: true,
                noMoreData: false,
            });
            return;
        }
        
        //通过其他判断，现在判断refreshing状态
        //refreshing等于Both，触发上拉加载更多
        console.log(this.props.refreshing);
        if (!this.props.refreshing && this.props.refreshState === FlatListState.Both) {
            this.loadMoreTimer = setTimeout(() => {
                console.log('this.props.onEndReached');
                this.props.onEndReached && this.props.onEndReached();
            }, delayTime);
        }
    }
}

const styles = StyleSheet.create({
    footerStyle: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        height: 44,
    },
    footerText: {
        fontSize: 14,
        color: '#555555',
        marginLeft: 7
    },
    emptyText: {
        fontSize: 17,
        color: '#666666'
    }
})