import React from 'react';
import {
    Dimensions,
    Platform,
} from 'react-native';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const X_WIDTH = 375;
const X_HEIGHT = 812;

export default class SizeUtil {
    static isIPhoneX = () => {
        return(
            Platform.OS === 'ios' &&
            ((screenHeight === X_HEIGHT && screenWidth === X_WIDTH) ||
                (screenWidth === X_HEIGHT && screenHeight === X_WIDTH))
        );
    }
    
    static ifIPhoneX = (iPhoneXStyle, iOSStyle, androidStyle) => {
        if (SizeUtil.isIPhoneX()) {
            return iPhoneXStyle;
        } else if (Platform.OS === 'ios') {
            return iOSStyle;
        } else {
            if (androidStyle) return androidStyle;
            return iOSStyle;
        }
    }
    
    static screenW = () => {
        return screenWidth;
    }
    
    static screenH = (hasTab, hasNav) => {
        if (SizeUtil.isIPhoneX()) {
            return screenHeight - (hasTab ? 83 : 0) - (hasNav ? 88 : 44);
        } else {
            return screenHeight - (hasTab ? 49 : 0) - (hasNav ? 64 : 20);
        }
    }
}