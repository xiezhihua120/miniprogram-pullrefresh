Component({
  properties: {
    pullText: {
      type: String,
      value: '下拉可以刷新',
    },
    releaseText: {
      type: String,
      value: '松开立即刷新',
    },
    loadingText: {
      type: String,
      value: '正在刷新数据中',
    },
    finishText: {
      type: String,
      value: '刷新完成',
    },
    pullUpText: {
      type: String,
      value: '上拉加载更多',
    },
    pullUpReleaseText: {
      type: String,
      value: '松开立即加载',
    },
    loadmoreText: {
      type: String,
      value: '正在加载更多数据',
    },
    loadmoreFinishText: {
      type: String,
      value: '加载完成',
    },
    nomoreText: {
      type: String,
      value: '已经全部加载完毕',
    },
    refreshing: {
      type: Boolean,
      value: false,
      observer: 'refreshingChange',
    },
    nomore: {
      type: Boolean,
      value: false,
    },
    disablePullDown: {
      type: Boolean,
      value: false,
    },
    disablePullUp: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    pullDownStatus: 0,
    pullUpStatus: 0,
    offsetY: -40,

    startY: 0,
    endY: 0,

    isOutBound: false,
    isLoadMoreVisiable: false,
    eventName: '',
  },

  ready: function() {
    var _this = this;
    this._observer = wx.createIntersectionObserver(this)
    this._observer.relativeTo('.scroll-view')
        .observe('.loadmore', (res) => {

          _this.isLoadMoreVisiable = (res.intersectionRatio > 0);
          if (this.data.startY > this.data.endY) {
            this.trigleLoadMore();
          }
        })
  },


  detached: function() {
    if (this._observer) {
      this._observer.disconnect()
    }
  },

  methods: {
    trigleLoadMore: function() {
      if (!this.properties.disablePullUp && this.isLoadMoreVisiable) {
        if (!this.properties.refreshing) {
          if (this.properties.nomore) {

          } else {
            this.setData({
              pullUpStatus: 2,
              eventName: 'loadmore',
            })
            this.triggerEvent('loadmore');
          }
        }
      }
    },

    touchstart: function(e) {
      this.data.startY = e.touches[0].pageY;
    },

    touchmove: function(e) {
      this.data.endY = e.touches[0].pageY;
    },

    /**
     * 滑动触底
     * @param e
     */
    touchend: function(e) {
      //console.log(e)
      if (this.data.isOutBound && this.data.offsetY > 0 && !this.properties.disablePullDown) {
        this.setData({
          pullDownStatus: 2,
          eventName: 'pulldownrefresh',
        })
        this.triggerEvent('pulldownrefresh');
      } else {
        this.setData({
          offsetY: -40,
          pullDownStatus: 0,
        })
      }

      if (this.data.startY > this.data.endY) {
        console.log("向上")
        if (this.isLoadMoreVisiable && this.data.pullUpStatus == 0) {
          this.trigleLoadMore();
        }
      } else {
        console.log("向下")
      }
    },

    /**
     * 滑动中
     * @param e
     */
    change: function(e) {
      if (this.properties.refreshing) return
      this.data.isOutBound = e.detail.source == 'touch-out-of-bounds'
      this.data.offsetY = e.detail.y;

      if (this.data.isOutBound) {
        if (this.data.offsetY > 0) {
          this.setData({
            pullDownStatus: 1,
          })
        }
      } else {
        if ((this.data.pullDownStatus != 0 && this.data.pullDownStatus != 3)) {
          this.setData({
            pullDownStatus: 0,
          })
        }
      }
    },

    refreshingChange: function(newVal, oldVal) {
      if (oldVal === true && newVal === false) {
        if (this.data.eventName == 'pulldownrefresh') {
          this.setData({
            offsetY: -40,
            pullDownStatus: 3,
          })
        }

        if (this.data.eventName == 'loadmore') {
          this.setData({
            offsetY: -40,
            pullUpStatus: 3,
          })
        }

        setTimeout(() => {
          this.setData({
            pullDownStatus: 0,
            pullUpStatus: 0
          })
        }, 500);
      }
    },
  },
})