import FacebookAdsApi from './[...]/src/api'
import { AdAccount, Campaign } from './[...]/src/objects'

//const accessToken = '[VALID_ACCESS_TOKEN]'
const accessToken = 'EAAUA6NP8iWYBAEeBZBlErdXcZCmGHm02riQgT4MkDrbXPZAUOAQhvtRGPXHqAcsW7WtzLa4JPKqQ1T9cJiBlpa6V0j6cJlDGqifKPS4Af8gAaTJw2q2nVZCHwN3QolZBPWFoEpAxjT9zx5ZBE0QDUEzV3sYXHrb0ecBm8cuAcGJI1X6hsoPkI2T1o0oCwzyNSYcJa3wLQPBQZDZD'

//const accountId = '[AD_ACCOUNT_ID]'  //130084257494704
const accountId = '130084257494704'

exports.testConnection = function(data, setresult) {

FacebookAdsApi.init(accessToken)

const account = new AdAccount({ 'id': accountId })
const insightsFields = ['impressions', 'frequency', 'unique_clicks', 'actions', 'spend', 'cpc']
const insightsParams = { date_preset: Campaign.DatePreset.last_90_days }
var campaigns

account.read([AdAccount.Fields.name])
  .then((account) => {
    account.getInsights(insightsFields, insightsParams)
      .then((actInsights) => UIsetAccountData(account, actInsights))
      .catch(UIRequestError)
    return account.getCampaigns([Campaign.Fields.name], { limit: 10 }) // fields array and params
  })
  .then((result) => {
    campaigns = result
    const campaign_ids = campaigns.map((campaign) => campaign.id)
    const campaignInsightsParams = Object.assign({
      level: 'campaign',
      filtering: [{ field: 'campaign.id', operator: 'IN', value: campaign_ids }]
    }, insightsParams)
    const campaigsInsightsFields = insightsFields.concat('campaign_id')
    return account.getInsights(campaigsInsightsFields, campaignInsightsParams)
  })
  .then((insights) => UIsetCampaignsData(campaigns, insights))
  .catch(UIRequestError)

}
