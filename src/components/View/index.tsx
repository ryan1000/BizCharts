import React from 'react';
import _isArray from '@antv/util/lib/is-array';
import _deepMix from '@antv/util/lib/deep-mix';
import _View from '@antv/g2/lib/chart/view';
import uniqueId from '@antv/util/lib/unique-id';

import RootChartContext from '../../context/root';
import ChartViewContext from '../../context/view';
import Base, { IBaseProps } from '../../Base';
import compareProps from '../../utils/compareProps';
import warn from '../../utils/warning';

export interface IView extends IBaseProps {
  data?: any[];
}

class View<T extends IView = IView> extends Base<T> {
  ChartBaseClass = _View;
  name = 'view';
  static defaultProps = {
    visible: true,
  }
  getInitalConfig(): any {
    const { region, start, end } = this.props;
    // console.log(88,start)
    warn(!start, 'start 属性将在4.1后废弃，请使用 region={{ start: {x:0,y:0}}} 替代')
    warn(!end, 'end 属性将在4.1后废弃，请使用 region={{ end: {x:0,y:0}}} 替代')
    // fixme: adepter3.5
    const regionCfg = _deepMix({start: { x: 0,y: 0 }, end: { x: 1, y: 1 }}, {start,end}, region );
    return { region: regionCfg };
  }
  initInstance() {
    this.id = uniqueId(this.name);
    // console.log(3, this.context)
    const options = this.getInitalConfig();
    this.g2Instance = this.context.chart.createView(options);
  }
  configInstance(preProps, curProps) {
    super.configInstance(preProps, curProps);
    const nextProps = this.props;
    if (_isArray(this.props.data)) {
      // console.log('data', this.props.data)
      this.g2Instance.data(this.props.data);
      // @ts-ignore
    } else if (this.props.data && _isArray(this.props.data.rows)) {
      // @ts-ignore
      this.g2Instance.data(this.props.data.rows);
      warn(false, '接口不再支持 DataView 格式数据，只支持标准 JSON 数组，所以在使用 DataSet 时，要取最后的 JSON 数组结果传入。4.1 后将删除此兼容，请使用 data={dv.rows}')
    }
    compareProps(preProps, nextProps, ['scale'], (value, key) => {
      this.g2Instance[key](...value);
    });
  }

  render () {
    return <ChartViewContext.Provider value={this.getInstance()}>
      <>{this.props.children}</>
    </ChartViewContext.Provider>;
  }
}

View.contextType = RootChartContext;

export default View;