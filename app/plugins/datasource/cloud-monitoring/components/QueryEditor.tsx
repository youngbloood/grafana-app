import React, { PureComponent } from 'react';

import { QueryEditorProps, toOption } from '@grafana/data';
import { EditorRows } from '@grafana/experimental';

import CloudMonitoringDatasource from '../datasource';
import { CloudMonitoringQuery, MetricQuery, QueryType, SLOQuery, CloudMonitoringOptions } from '../types';

import { defaultQuery } from './MetricQueryEditor';
import { QueryHeader } from './QueryHeader';
import { defaultQuery as defaultSLOQuery } from './SLOQueryEditor';

import { MetricQueryEditor, SLOQueryEditor } from './';

export type Props = QueryEditorProps<CloudMonitoringDatasource, CloudMonitoringQuery, CloudMonitoringOptions>;

export class QueryEditor extends PureComponent<Props> {
  async UNSAFE_componentWillMount() {
    const { datasource, query } = this.props;

    // Unfortunately, migrations like this need to go UNSAFE_componentWillMount. As soon as there's
    // migration hook for this module.ts, we can do the migrations there instead.
    if (!this.props.query.hasOwnProperty('metricQuery')) {
      const { hide, refId, datasource, key, queryType, maxLines, metric, ...metricQuery } = this.props.query as any;
      this.props.query.metricQuery = metricQuery;
    }

    if (![QueryType.METRICS, QueryType.SLO].includes(this.props.query.queryType)) {
      this.props.query.queryType = QueryType.METRICS;
    }

    await datasource.ensureGCEDefaultProject();
    if (!query.metricQuery.projectName) {
      this.props.query.metricQuery.projectName = datasource.getDefaultProject();
    }
  }

  onQueryChange(prop: string, value: MetricQuery | SLOQuery) {
    this.props.onChange({ ...this.props.query, [prop]: value });
    this.props.onRunQuery();
  }

  render() {
    const { datasource, query, onRunQuery, onChange } = this.props;
    const metricQuery = { ...defaultQuery(datasource), ...query.metricQuery };
    const sloQuery = { ...defaultSLOQuery(datasource), ...query.sloQuery };
    const queryType = query.queryType || QueryType.METRICS;
    const meta = this.props.data?.series.length ? this.props.data?.series[0].meta : {};
    const customMetaData = meta?.custom ?? {};
    const variableOptionGroup = {
      label: 'Template Variables',
      expanded: false,
      options: datasource.getVariables().map(toOption),
    };

    return (
      <EditorRows>
        <QueryHeader
          query={query}
          metricQuery={metricQuery}
          sloQuery={sloQuery}
          onChange={onChange}
          onRunQuery={onRunQuery}
        />
        {queryType === QueryType.METRICS && (
          <MetricQueryEditor
            refId={query.refId}
            variableOptionGroup={variableOptionGroup}
            customMetaData={customMetaData}
            onChange={(metricQuery: MetricQuery) => {
              this.props.onChange({ ...this.props.query, metricQuery });
            }}
            onRunQuery={onRunQuery}
            datasource={datasource}
            query={metricQuery}
          />
        )}

        {queryType === QueryType.SLO && (
          <SLOQueryEditor
            refId={query.refId}
            variableOptionGroup={variableOptionGroup}
            customMetaData={customMetaData}
            onChange={(query: SLOQuery) => this.onQueryChange('sloQuery', query)}
            onRunQuery={onRunQuery}
            datasource={datasource}
            query={sloQuery}
          />
        )}
      </EditorRows>
    );
  }
}
