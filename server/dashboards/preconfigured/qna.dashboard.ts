/// <reference path='../../../client/@types/types.d.ts'/>
import * as _ from 'lodash';

/* tslint:disable:indent quotemark max-line-length */
// The following line is important to keep in that format so it can be rendered into the page
export const config: IDashboardConfig = /*return*/ {
  id: 'qna',
  name: 'Sample QnA Maker dashboard',
  icon: 'chat',
  url: 'qna',
  description: 'Sample QnA Maker dashboard',
  preview: '/images/default.png',
  category: 'Bots - Advanced',
  html: `
    <div>
      <p>Displays <a href="https://qnamaker.ai" target="_blank">QnA Maker service</a> usage metrics.</p> 
      <h3>Requirements</h3>
      <p>To send the QnA Maker service data to Applications Insight it's necessary to use the 
      <a href="https://www.npmjs.com/package/botbuilder-cognitiveservices" target="_blank">botbuilder-cognitiveservices</a> 
      on the bot and override the
      <br/>
      <b>defaultWaitNextMessage(session, qnaMakerResult)</b>
      <br/>
      function to call the 
      <br/>
      <b>trackQNAEvent(context, userQuery, kbQuestion, kbAnswer, score)</b>
      <br/>
      function of the 
      <br/>
      <a href="https://www.npmjs.com/package/botbuilder-instrumentation#sending-logs-for-qna-maker-service" target="_blank">botbuilder-instrumentation</a>
      <br/>
      <p>That will enable the bot to send additional telemetries to Application Insight with the QnA Maker service information
      </p>
      <p>
        <span>Refer to the </span>
        <span>
          <a href="https://github.com/Azure/ibex-dashboard/blob/master/docs/bot-framework.md" target="_blank">
            bot-framework
          </a> docs for setup instructions.</span>
      </p>
    </div>
  `,
  config: {
    connections: {},
    layout: {
      isDraggable: true,
      isResizable: true,
      rowHeight: 30,
      verticalCompact: false,
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
    }
  },
  dataSources: [
    {
      id: 'timespan',
      type: 'Constant',
      params: { values: ['24 hours', '1 week', '1 month', '3 months'], selectedValue: '1 month' },
      format: 'timespan'
    },
    {
      id: 'ai',
      type: 'ApplicationInsights/Query',
      dependencies: {
        timespan: 'timespan',
        queryTimespan: 'timespan:queryTimespan',
        granularity: 'timespan:granularity'
      },
      params: {
        table: 'customEvents',
        queries: {
          avgScore: {
            query: () => `
              where name == 'MBFEvent.QNAEvent'
              | extend score=todouble(customDimensions.score)  
              | where score > 0
              | summarize avg=bin(avg(score) * 100, 1) `,
            format: {
              type: 'scorecard',
              args: {
                countField: 'avg',
                postfix: '%',
                thresholds: [
                  { value: 0, color: '#F44336', icon: 'sentiment_dissatisfied', heading: 'Sentiment' },
                  { value: 60, color: '#FFC107', icon: 'sentiment_satisfied', heading: 'Sentiment' },
                  { value: 80, color: '#4CAF50', icon: 'sentiment_very_satisfied', heading: 'Sentiment' }
                ],
                subvalueThresholds: [
                  { value: 0, subheading: 'Negative' },
                  { value: 60, subheading: 'Neutral' },
                  { value: 80, subheading: 'Positive' }
                ]
              }
            }
          },
          totalHits: {
            query: () => `
              where name == 'MBFEvent.QNAEvent'
              | summarize hits=count() `,
            format: { type: 'scorecard', args: { countField: 'hits' } }
          },
          timelineHits: {
            query: ({ granularity }) => `
              where name == 'MBFEvent.QNAEvent'
              | summarize hits=count() by bin(timestamp, ${granularity}) 
              | order by timestamp asc `,
            format: { type: 'timeline', args: { timeField: 'timestamp', valueField: 'hits' } }
          },
          timelineUsers: {
            query: ({ granularity }) => `
              where name == 'MBFEvent.QNAEvent'
              | extend userName=tostring(customDimensions.userName)
              | summarize count=dcount(userName) by bin(timestamp, ${granularity}), name, 
                channel=tostring(customDimensions.channel) 
              | order by timestamp asc`,
            format: { type: 'timeline', args: { timeField: 'timestamp', lineField: 'channel', valueField: 'count' } }
          },
          questions: {
            query: () => `
              extend userQuery=tostring(customDimensions.userQuery),
                question=tostring(customDimensions.kbQuestion),
                kbAnswer=tostring(customDimensions.kbAnswer),
                score=toint(customDimensions.score),
                timestamp=tostring(timestamp)
              | where name=='MBFEvent.QNAEvent'
              | project timestamp, userQuery, question, kbAnswer, score
              | summarize questions=count(userQuery) by question
              | order by questions desc`,
            format: {
              type: 'bars',
              args: { barsField: 'question', seriesField: 'question', valueField: 'questions' }
            }
          }
        }
      }
    }
  ],
  filters: [
    {
      type: 'TextFilter',
      title: 'Timespan',
      dependencies: { selectedValue: 'timespan', values: 'timespan:values' },
      actions: { onChange: 'timespan:updateSelectedValue' },
      first: true
    }
  ],
  elements: [
    {
      id: 'timelineHits',
      type: 'Timeline',
      title: 'Hit Rate',
      subtitle: 'How many questions were asked per timeframe',
      size: { w: 5, h: 8 },
      source: 'ai:timelineHits'
    },
    {
      id: 'channels',
      type: 'PieData',
      title: 'Channel Usage (Users)',
      subtitle: 'Total users sent per channel',
      size: { w: 5, h: 8 },
      source: 'ai:timelineUsers',
      props: { showLegend: true, entityType: 'messages' }
    },
    {
      id: 'scorecardAvgScore',
      type: 'Scorecard',
      title: 'Avg Score',
      size: { w: 2, h: 8 },
      dependencies: {
        card_avgscore_onClick: '::onScoreClick',
        card_totalhits_value: "ai:totalHits-value",
        card_totalhits_heading: '::Total hits',
        card_totalhits_icon: '::av_timer',
        card_totalhits_color: '::#2196F3',
      },
      source: { avgscore: 'ai:avgScore' },
      actions: {
        onScoreClick: { action: 'dialog:sentimentConversations', params: { title: 'args:heading', queryspan: 'timespan:queryTimespan' } }
      }
    },
    {
      id: 'qna_questions',
      type: 'BarData',
      title: 'QnA Graph',
      subtitle: 'QnA hits per question',
      size: { w: 12, h: 8 },
      source: 'ai:questions',
      props: { nameKey: 'question' },
      actions: {
        onBarClick: {
          action: 'dialog:questionDialog',
          params: { title: 'args:value', question: 'args:value', queryspan: 'timespan:queryTimespan' }
        }
      }
    }
  ],
  dialogs: [
    {
      id: 'sentimentConversations',
      width: '60%',
      params: ['title', 'queryspan'],
      dataSources: [
        {
          id: 'sentiment-conversations-data',
          type: 'ApplicationInsights/Query',
          dependencies: { queryTimespan: 'dialog_sentimentConversations:queryspan' },
          params: {
            query: () => `
              customEvents
              | extend conversation=tostring(customDimensions.conversationId),
                timestamp=tostring(customDimensions.timestamp),
                userId=tostring(customDimensions.userId),
                sentiment=toint(todouble(customDimensions.score)*100)
              | where name=='MBFEvent.QNAEvent'
              | summarize count=count(), sentiment=avg(sentiment), maxTimestamp=max(timestamp) by conversation
              | extend color=iff(sentiment > 80, '#4caf50', iff(sentiment < 60, '#F44336', '#FFc107')),
                icon=iff(sentiment > 80, 'sentiment_very_satisfied',
                iff(sentiment < 60, 'sentiment_dissatisfied', 'sentiment_satisfied'))
              | order by sentiment`,
            mappings: { id: (val, row, idx) => `Conversation ${idx}` }
          },
          calculated: ({ values }, dependencies) => {
            return {
              top5Positive: _.take(values, 5),
              top5Negative: _.takeRight(values, 5)
            };
          }
        }
      ],
      elements: [
        {
          id: 'top5positive',
          type: 'Table',
          size: { w: 5, h: 8 },
          dependencies: { values: 'sentiment-conversations-data:top5Positive' },
          props: {
            compact: true,
            cols: [
              { header: 'Top 5 Positive', field: 'id' },
              { header: null, width: '10px', field: 'icon', type: 'icon', color: 'color' },
              { header: 'Last Message', field: 'maxTimestamp', type: 'time', format: 'MMM-DD HH:mm:ss' },
              { header: 'Count', width: '10px', field: 'count' },
              { type: 'button', width: '10px', value: 'chat', click: 'openMessagesDialog' }
            ]
          },
          actions: {
            openMessagesDialog: {
              action: 'dialog:messages',
              params: { title: 'args:id', conversation: 'args:conversation', queryspan: 'timespan:queryTimespan' }
            }
          }
        },
        {
          id: 'top5negative',
          type: 'Table',
          size: { w: 5, h: 8 },
          dependencies: { values: 'sentiment-conversations-data:top5Negative' },
          props: {
            compact: true,
            cols: [
              { header: 'Top 5 Negative', field: 'id' },
              { header: null, width: '10px', field: 'icon', type: 'icon', color: 'color' },
              { header: 'Last Message', field: 'maxTimestamp', type: 'time', format: 'MMM-DD HH:mm:ss' },
              { header: 'Count', field: 'count' },
              { type: 'button', value: 'chat', click: 'openMessagesDialog' }
            ]
          },
          actions: {
            openMessagesDialog: {
              action: 'dialog:messages',
              params: { title: 'args:id', conversation: 'args:conversation', queryspan: 'timespan:queryTimespan' }
            }
          }
        }
      ]
    },
    {
      id: 'messages',
      width: '50%',
      params: ['title', 'conversation', 'queryspan'],
      dataSources: [
        {
          id: 'messages-data',
          type: 'ApplicationInsights/Query',
          dependencies: { conversation: 'dialog_messages:conversation', queryTimespan: 'dialog_messages:queryspan' },
          params: {
            query: ({ conversation }) => `
              customEvents
              | extend 
                conversation=tostring(customDimensions.conversationId),
                timestamp=tostring(customDimensions.timestamp),
                userId=tostring(customDimensions.userId),
                sentiment=toint(todouble(customDimensions.score)*100),
                userQuery=tostring(customDimensions.userQuery),
                question=tostring(customDimensions.kbQuestion),
                kbAnswer=tostring(customDimensions.kbAnswer)
              | where name == 'MBFEvent.QNAEvent' and conversation == "${conversation}" 
              | project timestamp, userQuery,question,kbAnswer, customDimensions.userName, userId, sentiment
              | order by timestamp asc
              `
          },
          calculated: (state, dependencies) => {
            const { values } = state;
            if (!values) { return; }
            const chat = values.map(msg => (
              _.extend(msg, {
                icon: isNaN(parseInt(msg.sentiment, 10)) ? '' :
                  msg.sentiment > 80 ? 'sentiment_very_satisfied' :
                    msg.sentiment < 60 ? 'sentiment_dissatisfied' : 'sentiment_satisfied',
                color: isNaN(parseInt(msg.sentiment, 10)) ? '' :
                  msg.sentiment > 80 ? '#4caf50' :
                    msg.sentiment < 60 ? '#FFc107' : '#F44336',
              })
            ));
            return { chat };
          }
        }
      ],
      elements: [
        {
          id: 'messages-list',
          type: 'Table',
          title: 'Messages',
          size: { w: 12, h: 16 },
          dependencies: { values: 'messages-data:chat' },
          props: {
            rowClassNameField: 'eventName',
            cols: [
              { header: 'Timestamp', width: '50px', field: 'timestamp', type: 'time', format: 'MMM-DD HH:mm:ss' },
              { width: '10px', field: 'icon', type: 'icon', color: 'color' },
              { header: 'User Query', field: 'userQuery' },
              { header: 'Detected Question', field: 'question' },
              { header: 'KB Answer', field: 'kbAnswer' }
            ]
          }
        }
      ]
    },
    {
      id: 'questionDialog',
      width: '40%',
      params: ['title', 'question', 'queryspan'],
      dataSources: [
        {
          id: 'sentiment-conversations-data-question',
          type: 'ApplicationInsights/Query',
          dependencies: { queryTimespan: 'dialog_questionDialog:queryspan', question: 'dialog_questionDialog:question' },
          params: {
            query: ({ question }) => `
              customEvents
              | extend conversation=tostring(customDimensions.conversationId),
                timestamp=tostring(customDimensions.timestamp),
                userId=tostring(customDimensions.userId),
                sentiment=toint(todouble(customDimensions.score)*100),
                question=tostring(customDimensions.kbQuestion)
              | where name=='MBFEvent.QNAEvent' and question=="${question}"
              | summarize count=count(), sentiment=avg(sentiment), maxTimestamp=max(timestamp) by conversation
              | extend color=iff(sentiment > 80, '#4caf50', iff(sentiment < 60, '#F44336', '#FFc107')),
                icon=iff(sentiment > 80, 'sentiment_satisfied',
                iff(sentiment < 60, 'sentiment_dissatisfied', 'sentiment_satisfied'))
              | order by maxTimestamp`,
            mappings: { id: (val, row, idx) => `Conversation ${idx}` }
          },
          calculated: ({ values }, dependencies) => {
            return {
              top5: _.take(values, 5),
              totalConversations: values ? values.length : 0
            };
          }
        }
      ],
      elements: [
        {
          id: 'top5',
          type: 'Table',
          size: { w: 5, h: 8 },
          dependencies: { values: 'sentiment-conversations-data-question:top5' },
          props: {
            compact: true,
            cols: [
              { header: 'Top 5 conversations', field: 'id' },
              { header: null, width: '10px', field: 'icon', type: 'icon', color: 'color' },
              { header: 'Last Message', field: 'maxTimestamp', type: 'time', format: 'MMM-DD HH:mm:ss' },
              { header: 'Count', width: '10px', field: 'count' },
              { type: 'button', width: '10px', value: 'chat', click: 'openMessagesDialog' }
            ]
          },
          actions: {
            openMessagesDialog: {
              action: 'dialog:messages',
              params: { title: 'args:id', conversation: 'args:conversation', queryspan: 'timespan:queryTimespan' }
            }
          }
        },
        {
          id: 'scorecard_total_conversation',
          type: 'Scorecard',
          title: 'Conersations',
          size: { w: 3, h: 3 },
          dependencies: {
            card_avgscore_value: 'sentiment-conversations-data-question:totalConversations',
            card_avgscore_color: '::#2196F3',
            card_avgscore_icon: '::av_timer',
            card_avgscore_heading: '::Conversations',
            card_avgscore_onClick: '::onConversationsClick',
          },
          props: { nameKey: 'question' },
          actions: {
            onConversationsClick: { action: 'dialog:questionConversationDialog', params: { title: 'args:question', question: 'args:question', queryspan: 'timespan:queryTimespan' } }
          }
        }
      ]
    },
    {
      id: 'questionConversationDialog',
      width: '40%',
      params: ['title', 'question', 'queryspan'],
      dataSources: [
        {
          id: 'sentiment-conversations-data-question-all',
          type: 'ApplicationInsights/Query',
          dependencies: { queryTimespan: 'dialog_questionDialog:queryspan', question: 'dialog_questionDialog:question' },
          params: {
            query: ({ question }) => `
              customEvents
              | extend conversation=tostring(customDimensions.conversationId),
                timestamp=tostring(customDimensions.timestamp),
                userId=tostring(customDimensions.userId),
                sentiment=toint(todouble(customDimensions.score)*100),
                question=tostring(customDimensions.kbQuestion)
              | where name=='MBFEvent.QNAEvent' and question=="${question}"
              | summarize count=count(), sentiment=avg(sentiment), maxTimestamp=max(timestamp) by conversation
              | extend color=iff(sentiment > 80, '#4caf50', iff(sentiment < 60, '#F44336', '#FFc107')),
                icon=iff(sentiment > 80, 'sentiment_satisfied',
                iff(sentiment < 60, 'sentiment_dissatisfied', 'sentiment_satisfied'))
              | order by maxTimestamp`,
            mappings: { id: (val, row, idx) => `Conversation ${idx}` }
          },
          calculated: ({ values }, dependencies) => {
            return {
              conversations: values,
            };
          }
        }
      ],
      elements: [
        {
          id: 'conversations-by-questions',
          type: 'Table',
          size: { w: 12, h: 16 },
          dependencies: { values: 'sentiment-conversations-data-question-all:conversations' },
          props: {
            compact: true,
            cols: [
              { header: 'Conversations', field: 'id' },
              { header: null, width: '10px', field: 'icon', type: 'icon', color: 'color' },
              { header: 'Last Message', field: 'maxTimestamp', type: 'time', format: 'MMM-DD HH:mm:ss' },
              { header: 'Count', width: '10px', field: 'count' },
              { type: 'button', width: '10px', value: 'chat', click: 'openMessagesDialog' }
            ]
          },
          actions: {
            openMessagesDialog: {
              action: 'dialog:messages',
              params: { title: 'args:id', conversation: 'args:conversation', queryspan: 'timespan:queryTimespan' }
            }
          }
        }
      ]
    }
  ]
};