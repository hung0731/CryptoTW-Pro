# Affiliate API Documentation

## Update Log

| Effective Time (UTC+8) | Type  | Description                                          | Version |
| ---------------------- | ----- | ---------------------------------------------------- | ------- |
| 2025.09.25 16:00 | Added | 1. /affiliate-api/v2/future/tradePage 2. /affiliate-api/v2/future/tradeTotal 3. /affiliate-api/v2/future/trade/remark 4. /affiliate-api/v2/future/positionPage 5. /affiliate-api/v2/future/orderPage 6. /affiliate-api/v2/future/triggerOrderPage 7. /affiliate-api/v2/future/finishOrderPage 8. /affiliate-api/v2/future/finishTriggerOrderPage  | V1.8 |
| 2025.09.03 16:00       | Added | `/v2/money/detail/list` new field: `withdrawOrderId` | V1.7    |
| 2025.06.27 16:00 | Added | Added new field to the following interfaces: /user/team/list, /user/list, and /user/info: Total Spot Assets (USDT only) | V1.6 |
| 2025.02.27 16:00       | New            | Added the following endpoint: `/affiliate-api/v2/money/detail/list`                                                                                                                                                                                                                                                                                                                                                                                      | V1.5    |
| 2024.11.07 16:00       | New            | Added the following endpoint: `/affiliate-api/v2/trade/future`<br/>Note: Starting from 2024.10.31, the commission settlement cycle has been changed to T+1. Commissions generated from orders traded between 00:00 and 24:00 on day T will be distributed after 10:00 on day T+1. Daily commission summaries are now calculated based on 00:00-24:00 trade time. This change affects the data of the following endpoint: `/commission/stats/symbol/list` | V1.4    |
| 2024.09.18 16:00       | Modified       | Added spot and futures asset fields to `user/team/list`, `user/list`, and `user/info` endpoints                                                                                                                                                                                                                                                                                                                                                          | V1.3    |
| 2024.09.10 18:00       | New + Modified | 1. Added `user/team/list` endpoint to replace `user/list`. If currently using `user/list`, please switch to `user/team/list` ASAP.<br/>2. Added `symbol/list` endpoint for querying users' daily commission amounts                                                                                                                                                                                                                                      | V1.2    |
| 2024.08.01 11:00       | New            | Added `user/info` endpoint                                                                                                                                                                                                                                                                                                                                                                                                                               | V1.1    |
| 2024.07.18 21:00       | New            | Initial version of documentation                                                                                                                                                                                                                                                                                                                                                                                                                         | V1.0    |

---

## Access Instructions

### Signature Authentication

Refer to LBank signature authentication - [LBank Signature Authentication](https://www.lbank.com/zh-CN/docs/index.html#c64cd15fdc)

### Access URL

#### **REST API**

Domain: [https://affiliate.lbankverify.com/](https://affiliate.lbankverify.com/) (Requires IP whitelist)

---

### Response Examples

**Success:**

```json
{
  "result": "true",
  "error_code": 0,
  "data": [],
  "ts": 1721305060631
}
```

**Failure:**

```json
{
  "result": "false",
  "msg": "Parameter can not be null",
  "error_code": 10001,
  "ts": 1721305093220
}
```

---

## Notes

1. Current version is for internal use only, enabling agents to query data of their team members (the user's team).
2. Pagination uses rolling method with `start + pageSize`. If `start` is not provided, it defaults to 0. For subsequent pages, pass `start + pageSize` as the new `start`. For example: page 1 - `start=0, pageSize=10`; page 2 - `start=10, pageSize=10`; etc.
3. Pagination query limit is max 100 entries. Requests exceeding this limit will return error code `20026` (invalid parameter).

---

# Query Endpoints

---

### Query Team Member Information (New Version)

Rate Limit: 5 requests/10s

`GET /affiliate-api/v2/invite/user/team/list`

**Request Parameters:**

| Name      | Type | Required | Description                                              |
| --------- | ---- | -------- | -------------------------------------------------------- |
| startTime | Long | Yes      | Registration start time                                  |
| endTime   | Long | Yes      | Registration end time                                    |
| start     | int  | Yes      | Start index, default 0; next page use `start + pageSize` |
| pageSize  | int  | Yes      | Number of entries (max 100)                              |

**Response Parameters:**

| Name                | Type    | Description                                                                          |
| ------------------- | ------- | ------------------------------------------------------------------------------------ |
| openId              | String  | User's openId                                                                        |
| code                | String  | Referral Code                                                                        |
| createTime          | Long    | Registration time (timestamp)                                                        |
| directInvitation    | boolean | Direct invitee or not                                                                |
| deposit             | boolean | Has deposits/withdrawals or not                                                      |
| transaction         | boolean | Has traded or not                                                                    |
| kycStatus           | Integer | KYC status: 0 - not verified, 1 - verified                                           |
| userLevel           | Integer | User Level: 1–21 (General Agent, Level 1–20 Partner), 0 - Invitee, 99 - Regular user |
| currencyFeeAmt      | String  | Spot Commission Rate (if agent)                                                      |
| contractFeeAmt      | String  | Futures Commission Rate (if agent)                                                   |
| currencyTotalFeeAmt | String  | Total Spot Assets                                                                    |
| currencyTotalFeeAmtUsdt | String | Total Spot Assets (USDT only)                                                     |
| contractTotalFeeAmt | String  | Total Futures Assets                                                                 |
| reserveAmt          | String  | Futures Bonus                                                                        |

**Response Example:**

```json
{
  "result": "true",
  "error_code": 0,
  "data": [{
    "id": 1001,
    "openId": "LBA0001001",
    "code": "3DFE",
    "createTime": 1721187212000,
    "directInvitation": false,
    "deposit": false,
    "transaction": false,
    "kycStatus": 0,
    "userLevel": 2,
    "currencyFeeAmt": "90",
    "contractFeeAmt": "90",
    "currencyTotalFeeAmt": "0.0000",
    "currencyTotalFeeAmtUsdt": "0.0000",
    "contractTotalFeeAmt": "0.0000",
    "reserveAmt": "0.0000"
  }],
  "ts": 1721305060631
}
```

---

### Query Team Member Information (Old Version, Deprecated)

Rate Limit: 5 requests/10s

`GET /affiliate-api/v2/invite/user/list`

**Request Parameters:**

| Name      | Type | Required | Description                                                            |
| --------- | ---- | -------- | ---------------------------------------------------------------------- |
| startTime | Long | Yes      | Registration start time                                                |
| endTime   | Long | Yes      | Registration end time                                                  |
| start     | int  | Yes      | Starting data ID, default 0. For next page, use max ID of current page |
| pageSize  | int  | Yes      | Number of entries (max 100)                                            |

**Response Parameters:**
Same as above (New Version).

**Response Example:**
Same as above (New Version).

---

### Query Single Team Member Information

Rate Limit: 5 requests/10s

`GET /affiliate-api/v2/invite/user/info`

**Request Parameters:**

| Name   | Type   | Required | Description |
| ------ | ------ | -------- | ----------- |
| openId | String | Yes      | User openId |

**Response Parameters:**

| Name                | Type    | Description                                                                          |
| ------------------- | ------- | ------------------------------------------------------------------------------------ |
| openId              | String  | User openId                                                                          |
| code                | String  | Referral Code                                                                        |
| createTime          | Long    | Registration time                                                                    |
| directInvitation    | boolean | Direct invitee or not                                                                |
| deposit             | boolean | Has deposits/withdrawals or not                                                      |
| transaction         | boolean | Has traded or not                                                                    |
| kycStatus           | Integer | KYC status: 0 - not verified, 1 - verified                                           |
| userLevel           | Integer | User Level: 1–21 (General Agent, Level 1–20 Partner), 0 - Invitee, 99 - Regular user |
| currencyFeeAmt      | String  | Spot Commission Rate (if agent)                                                      |
| contractFeeAmt      | String  | Futures Commission Rate (if agent)                                                   |
| inviteResult        | boolean | Whether queried user is in the user's team; if false, other fields are not reliable  |
| currencyTotalFeeAmt | String  | Total Spot Assets                                                                    |
| currencyTotalFeeAmtUsdt | String | Total Spot Assets (USDT only)                                                     | 
| contractTotalFeeAmt | String  | Total Futures Assets                                                                 |
| reserveAmt          | String  | Futures Bonus                                                                        |

**Response Example:**

```json
{
  "result": "true",
  "error_code": 0,
  "data": {
    "openId": null,
    "code": null,
    "createTime": null,
    "directInvitation": false,
    "deposit": false,
    "transaction": false,
    "kycStatus": null,
    "userLevel": null,
    "currencyFeeAmt": null,
    "contractFeeAmt": null,
    "inviteResult": false,
    "currencyTotalFeeAmt": "0.0000",
    "currencyTotalFeeAmtUsdt": "0.0000",
    "contractTotalFeeAmt": "0.0000",
    "reserveAmt": "0.0000"
  },
  "ts": 1722247098773
}
```

---

### Query Daily Commission Summary by Coin

Rate Limit: 5 requests/10s

`GET /affiliate-api/v2/commission/stats/symbol/list`

**Request Parameters:**

| Name      | Type   | Required | Description                                                |
| --------- | ------ | -------- | ---------------------------------------------------------- |
| openId    | String | Yes      | User openId who received commission                        |
| tradeType | String | Yes      | Trade type: 0 - Spot, 1 - Futures, 10 - Spot + Futures     |
| startTime | Long   | Yes      | Trade start date                                           |
| endTime   | Long   | Yes      | Trade end date                                             |
| coin      | Long   | Yes      | Coin ID for commission; null for all coins                 |
| start     | int    | Yes      | Starting index, default 0; for next page: start + pageSize |
| pageSize  | int    | Yes      | Number of entries (max 100)                                |

**Response Parameters:**

| Name       | Type   | Description                         |
| ---------- | ------ | ----------------------------------- |
| openId     | String | User openId who received commission |
| coinSymbol | String | Coin symbol                         |
| amount     | String | Amount                              |
| tradeType  | String | Trade type: 0 - Spot, 1 - Futures   |
| statsDate  | Long   | Trade date                          |
| usdtAmount | String | Amount in USDT equivalent           |

**Response Example:**

```json
{
  "result": "true",
  "error_code": 0,
  "data": [
    {
      "openId": "LBA0H1xxxx",
      "coinSymbol": "usdt",
      "amount": "71.489088",
      "tradeType": 1,
      "statsDate": 1724774400000,
      "usdtAmount": "0"
    }
  ],
  "ts": 1725330101487
}
```

---

### Query Daily Trade Volume and Fee for Single Team Member

Rate Limit: 5 requests/10s

`GET /affiliate-api/v2/trade/user`

**Request Parameters:**

| Name      | Type   | Required | Description                                            |
| --------- | ------ | -------- | ------------------------------------------------------ |
| openId    | String | Yes      | User openId                                            |
| tradeType | String | Yes      | Trade type: 0 - Spot, 1 - Futures, 10 - Spot + Futures |
| startTime | Long   | Yes      | Trade start date                                       |
| endTime   | Long   | Yes      | Trade end date                                         |

**Response Parameters:**

| Name      | Type   | Description  |
| --------- | ------ | ------------ |
| openId    | String | User openId  |
| statsDate | Long   | Trade date   |
| tradeAmt  | String | Trade volume |
| feeAmt    | String | Fee amount   |

**Response Example:**

```json
{
  "result": "true",
  "error_code": 0,
  "data": [
    {
      "openId": "LBA0H14XXX",
      "statsDate": 1721145600000,
      "tradeAmt": "0",
      "feeAmt": "0"
    }
  ],
  "ts": 1731035663458
}
```

---

### Query Daily Trade Volume and Fee for Team

Rate Limit: 5 requests/10s

`GET /affiliate-api/v2/trade/user/team`

**Request Parameters:**

| Name      | Type   | Required | Description                                            |
| --------- | ------ | -------- | ------------------------------------------------------ |
| openId    | String | Yes      | User openId                                            |
| tradeType | String | Yes      | Trade type: 0 - Spot, 1 - Futures, 10 - Spot + Futures |
| startTime | Long   | Yes      | Trade start date                                       |
| endTime   | Long   | Yes      | Trade end date                                         |

**Response Parameters:**

| Name      | Type   | Description  |
| --------- | ------ | ------------ |
| openId    | String | User openId  |
| statsDate | Long   | Trade date   |
| tradeAmt  | String | Trade volume |
| feeAmt    | String | Fee amount   |

**Response Example:**

```json
{
  "result": "true",
  "error_code": 0,
  "data": [
    {
      "openId": "LBA0H1XXXX",
      "statsDate": 1721145600000,
      "tradeAmt": "0",
      "feeAmt": "0"
    }
  ],
  "ts": 1731035663458
}
```

---

### Query Cumulative Futures Turnover and Fees in Time Range

Rate Limit: 5 requests/10s

`GET /affiliate-api/v2/trade/future`

**Request Parameters:**

| Name      | Type   | Required | Description                                  |
| --------- | ------ | -------- | -------------------------------------------- |
| openId    | String | Yes      | User openId                                  |
| userType  | String | Yes      | User scope (enum): SELF, SUB, SELF\_SUB, ALL |
| symbol    | String | No       | Trading pair (optional)                      |
| startTime | Long   | Yes      | Start date                                   |
| endTime   | Long   | Yes      | End date                                     |

**Response Parameters:**

| Name     | Type   | Description                               |
| -------- | ------ | ----------------------------------------- |
| turnover | String | Cumulative futures turnover in time range |
| fee      | String | Cumulative futures fees in time range     |

**Response Example:**

```json
{
  "result": "true",
  "error_code": 0,
  "data": {
    "turnover": "0",
    "fee": "0"
  },
  "ts": 1731036185769
}
```

---

### Query Deposit/Withdrawal Details in Time Range

Rate Limit: 5 requests/10s

`GET /affiliate-api/v2/money/detail/list`

**Request Parameters:**


| Name            | Type   | Required | Description                                                                                                                                |
| --------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| openId          | String | Yes      | User openId                                                                                                                                |
| userType        | String | Yes      | User scope (enum): SELF, SUB, SELF\_SUB, ALL                                                                                               |
| startTime       | Long   | Yes      | Start creation timestamp (ms)                                                                                                              |
| endTime         | Long   | Yes      | End creation timestamp (ms)                                                                                                                |
| subInOutType    | String | Yes      | Deposit/Withdrawal type enum: IN\_DEPOSIT, OUT\_WITHDRAW, IN\_OTC\_BUY, OUT\_OTC\_SELL, IN\_INNER\_TRANSFER\_IN, OUT\_INNER\_TRANSFER\_OUT |
| assetCode       | String | No       | Coin symbol, null for all                                                                                                                  |
| updateStartTime | Long   | No       | Start update timestamp (ms)                                                                                                                |
| updateEndTime   | Long   | No       | End update timestamp (ms)                                                                                                                  |
| start           | int    | Yes      | Starting index, default 0; for next page: start + pageSize                                                                                 |
| pageSize        | int    | Yes      | Number of entries (max  100.                                                                                                                  |



**Response Parameters:**

| Name         | Type    | Description                                                                          |
| ------------ | ------- | ------------------------------------------------------------------------------------ |
| openId       | String  | User openId                                                                          |
| userLevel    | Integer | User Level: 1–21 (General Agent, Level 1–20 Partner), 0 - Invitee, 99 - Regular user |
| subInOutType | String  | Deposit/Withdrawal type                                                              |
| assetCode    | String  | Coin symbol                                                                          |
| assetNum     | String  | Amount                                                                               |
| status       | String  | Status                                                                               |
| subStatus    | String  | Sub-status                                                                           |
| createTime   | Long    | Creation time                                                                        |
| updateTime   | Long    | Update time                                                                          |
| withdrawOrderId  | String    | withdraw Order Id                                                                          |
                                                                      

**Response Example:**

```json
{
  "result": "true",
  "error_code": 0,
  "data": [{
    "openId": "LBA0HXXXX",
    "userLevel": 2,
    "subInOutType": "On-chain Deposit",
    "assetCode": "USDT",
    "assetNum": "102.581",
    "status": "Completed",
    "subStatus": "Deposit Successful",
    "createTime": 1737240179000,
    "updateTime": 1737240179000,
    "withdrawOrderId": "220241015150159"
  }],
  "ts": 1740563092165
}
```

## Query Futures Trade History
`Rate Limit：5次/10s`

`GET `  `/affiliate-api/v2/future/tradePage`

**Request Parameters**:

| Parameter Name           | Type   | Required  | Description                                                                   |
|-----------------|--------|-------|----------------------------------------------------------------------|
| openId          | String | true  | openId                                                               |
| userType        | String | true  | User scope (enum): SELF: current user only; SUB: Direct Referrals; SELF_SUB: current user + Direct Referrals; ALL: current user + Referrals of All Levels |
| symbol          | String| false | Trading pair                                                                  |
| startTime       | Long   | true  | Start creation time (timestamp in milliseconds)                                                         |
| endTime         | Long   | true  | End creation time (timestamp in milliseconds)                                                      |
| loginUid    | String | false | Login user UID                                                             |
| orderType       | int | false | Order type: 1 - Regular order, 2 - Position voucher order                                                          |
| start           | int    | true  | Query starting position, default 0. For subsequent pages, use start + pageSize                        |
| pageSize        | int    | true  | Number of records per query (maximum 100)                                                       |


**Response Parameters**:

| Parameter Name | Type       | Description                                                            |
| --- |------------|---------------------------------------------------------------|
| tradeId        | String     | Trade ID                                                                                                                                                                                             |
| memberOpenId   | String     | Trader openId                                                                                                                                                                                        |
| remark         | String     | Remark                                                                                                                                                                                               |
| tradeTime      | Long       | Trade execution time                                                                                                                                                                                 |
| insertTime     | Long       | Settlement time                                                                                                                                                                                      |
| instrumentId   | String     | Contract symbol                                                                                                                                                                                      |
| leverage       | String     | Leverage                                                                                                                                                                                             |
| direction      | String     | Trade direction                                                                                                                                                                                      |
| volume         | String     | Executed quantity                                                                                                                                                                                    |
| turnover       | BigDecimal | Executed amount                                                                                                                                                                                      |
| feeCurrency    | String     | Fee currency                                                                                                                                                                                         |
| offsetFlag     | String     | Offset flag (`0`: Open; `1`: Close; `2`: Forced liquidation; `3`: Close Today; `4`: Close Yesterday; `5`: Close All; `6`: Close by designated order; `7`: Close by designated trade; `8`: Max Close) |
| closeProfit    | String     | Realized PnL from closing                                                                                                                                                                            |
| fee            | String     | Trading fee                                                                                                                                                                                          |
| payFee         | String     | Paid fee                                                                                                                                                                                             |
| rebateRatio    | String     | Rebate ratio                                                                                                                                                                                         |
| commission     | String     | Commission                                                                                                                                                                                           |
| commissionUsdt | String     | Commission in USDT                                                                                                                                                                                   |
| rebateTime     | Long       | Rebate timestamp                                                                                                                                                                                     |
| orderUuid      | String     | Order UUID                                                                                                                                                                                           |
| price          | String     | Execution price                                                                                                                                                                                      |
| matchRole      | String     | Execution role (`0`: Undifferentiated; `1`: Taker; `2`: Maker)                                                                                                                                       |
| orderId        | String     | Order ID                                                                                                                                                                                             |
| userLevel      | Integer    | User level (`1–10`: Agent Levels 1–10, `0`: Invitee, `99`: Referred User, `100`: Individual Customer)                                                                                                |
| documentary    | Integer    | Copy trading flag (`1`: Yes, `2`: No)                                                                                                                                                                |



**Response Example**:

```json
{
  "result": "true",
  "error_code": 0,
  "data": {
    "totalPage": 1,
    "hasNext": false,
    "page": {
      "symbol": null,
      "orderType": null,
      "sortColumn": null,
      "pageNo": 1,
      "openId": "324c527f-742b-4cc7-8b69-9622de8b3c9b",
      "loginUid": null,
      "start": 0,
      "pageSize": 20,
      "startTime": 1755484177000,
      "userType": "ALL",
      "endTime": 1756809392000,
      "sortDirect": null
    },
    "totalCount": 20,
    "resultList": [
      {
        "orderUuid": "1000149869817479",
        "leverage": "1",
        "fee": "0.0266",
        "remark": null,
        "closeprofit": "-1.7408",
        "commissionUsdt": null,
        "offsetflag": "5",
        "payFee": null,
        "userLevel": null,
        "price": "3.914",
        "commission": null,
        "rebateRatio": null,
        "turnover": 53.2315742,
        "matchrole": "1",
        "rebateTime": null,
        "tradeid": "1000143411186950",
        "documentary": 1,
        "tradetime": 1755484177,
        "direction": "1",
        "inserttime": 1755484177,
        "memberOpenId": "LBA0A32906",
        "orderid": null,
        "instrumentid": "DOTUSDT",
        "volume": "13.6003",
        "feecurrency": "USDT"
      }
    ]
  },
  "ts": 1756977985740
}
```

## Query Futures Trade History - Summary
`Rate Limit: 5 requests / 10s`

`GET `  `/affiliate-api/v2/future/tradeTotal`

**Request Parameters**:

| Parameter Name | Type   | Required | Description                                                                                                                                                       |
|-----------------|--------|-------|----------------------------------------------------------------------|
| openId         | String | true     | openId                                                                                                                                                            |
| userType       | String | true     | User scope (enum): `SELF`: current user only; `SUB`: Direct Referrals; `SELF_SUB`: current user + Direct Referrals; `ALL`: current user + Referrals of All Levels |
| symbol         | String | false    | Trading pair                                                                                                                                                      |
| startTime      | Long   | true     | Start creation time (timestamp in milliseconds)                                                                                                                   |
| endTime        | Long   | true     | End creation time (timestamp in milliseconds)                                                                                                                     |
| loginUid       | String | false    | Login user UID                                                                                                                                                    |
| orderType      | int    | false    | Order type: `1` - Regular order, `2` - Position voucher order                                                                                                     |
| start          | int    | true     | Query starting index, default `0`. For subsequent pages, use `start + pageSize`                                                                                   |
| pageSize       | int    | true     | Number of records to return (max 100)                                                                                                                             |


**Response Parameters:**

| Parameter Name | Type       | Description          |
| -------------- | ---------- | -------------------- |
| turnover       | BigDecimal | Total trading volume |
| fee            | String     | Total fees           |
| payFee         | String     | Actual fees paid     |


**Response Example:**

```json
{
  "result": "true",
  "error_code": 0,
  "data": {
    "turnover": "15315.1597",
    "fee": "7.6575",
    "payFee": "0"
  },
  "ts": 1756978859965
}
```

## Current Futures Positions
`Rate Limit: 5 requests / 10s`

`GET `  `/affiliate-api/v2/future/positionPage`

**Request Parameters:**

| Parameter Name | Type   | Required | Description                                                                                                                                                       |
|-----------------|--------|-------|----------------------------------------------------------------------|
| openId         | String | true     | openId                                                                                                                                                            |
| userType       | String | true     | User scope (enum): `SELF`: current user only; `SUB`: Direct Referrals; `SELF_SUB`: current user + Direct Referrals; `ALL`: current user + Referrals of All Levels |
| symbol         | String | false    | Trading pair                                                                                                                                                      |
| loginUid       | String | false    | Login user UID                                                                                                                                                    |
| orderType      | int    | false    | Order type: `1` - Regular order, `2` - Position voucher order                                                                                                     |
| start          | int    | true     | Query starting index, default `0`. For subsequent pages, use `start + pageSize`                                                                                   |
| pageSize       | int    | true     | Number of records to return (max 100)                                                                                                                             |


**Response Parameters:**

| Parameter Name            | Type       | Description                                                                                           |
| ------------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| positionFaceValue         | String     | Position face value                                                                                   |
| openId                    | String     | User ID                                                                                               |
| remark                    | String     | User remark                                                                                           |
| estimatedLiquidationPrice | String     | Estimated liquidation price                                                                           |
| userLevel                 | int        | User level (`1–20`: Agent Levels 1–20; `0`: Invitee; `99`: Referred User; `100`: Individual Customer) |
| memberId                  | String     | Member ID                                                                                             |
| tradeUnitId               | String     | Trade unit ID                                                                                         |
| exchangeId                | String     | Exchange ID                                                                                           |
| instrumentId              | String     | Instrument/contract symbol                                                                            |
| posiDirection             | String     | Position direction (`0`: Long; `1`: Short; `2`: Net)                                                  |
| positionId                | String     | Position ID                                                                                           |
| productId                 | String     | Product ID                                                                                            |
| productGroup              | String     | Product group                                                                                         |
| prePosition               | BigDecimal | Previous position size                                                                                |
| position                  | BigDecimal | Total position size                                                                                   |
| longFrozen                | BigDecimal | Frozen long position                                                                                  |
| shortFrozen               | BigDecimal | Frozen short position                                                                                 |
| masterAccountId           | String     | Master account ID                                                                                     |
| preLongFrozen             | BigDecimal | Previous frozen long                                                                                  |
| preShortFrozen            | BigDecimal | Previous frozen short                                                                                 |
| highestPosition           | BigDecimal | Maximum position                                                                                      |
| closePosition             | BigDecimal | Closable position                                                                                     |
| positionCost              | BigDecimal | Position cost                                                                                         |
| costPrice                 | BigDecimal | Average entry price                                                                                   |
| useMargin                 | BigDecimal | Margin used                                                                                           |
| frozenMargin              | BigDecimal | Frozen margin                                                                                         |
| longFrozenMargin          | BigDecimal | Frozen long margin                                                                                    |
| shortFrozenMargin         | BigDecimal | Frozen short margin                                                                                   |
| closeProfit               | BigDecimal | Realized PnL from closing                                                                             |
| totalPositionCost         | BigDecimal | Total entry cost                                                                                      |
| totalCloseProfit          | BigDecimal | Total realized PnL                                                                                    |
| openPrice                 | BigDecimal | Average entry price                                                                                   |
| closePrice                | BigDecimal | Average exit price                                                                                    |
| tradeFee                  | BigDecimal | Trading fee                                                                                           |
| positionFee               | BigDecimal | Position holding fee / dividend                                                                       |
| leverage                  | BigDecimal | Leverage ratio                                                                                        |
| accountId                 | String     | Account ID                                                                                            |
| currency                  | String     | Currency                                                                                              |
| priceCurrency             | String     | Quote currency                                                                                        |
| clearCurrency             | String     | Settlement currency                                                                                   |
| settlementGroup           | String     | Settlement group ID                                                                                   |
| isCrossMargin             | int        | Cross margin flag (`1`: Yes, `0`: No)                                                                 |
| closeOrderSysId           | String     | Close order system ID                                                                                 |
| closeOrderId              | String     | Close order ID                                                                                        |
| slTriggerPrice            | BigDecimal | Stop-loss trigger price                                                                               |
| tpTriggerPrice            | BigDecimal | Take-profit trigger price                                                                             |
| userId                    | String     | Last modified user ID                                                                                 |
| beginTime                 | Long       | Position start time (when size > 0)                                                                   |
| insertTime                | Long       | Position creation time                                                                                |
| lastOpenTime              | Long       | Last entry time                                                                                       |
| updateTime                | Long       | Last update time                                                                                      |
| businessNo                | Long       | Business sequence number                                                                              |
| isAutoAddMargin           | int        | Auto margin replenishment flag                                                                        |
| frequency                 | int        | Update frequency (per second)                                                                         |
| maintMargin               | BigDecimal | Maintenance margin                                                                                    |
| unrealProfit              | BigDecimal | Unrealized PnL                                                                                        |
| liquidPrice               | BigDecimal | Liquidation price                                                                                     |
| createTime                | String     | Creation time                                                                                         |
| copyMemberId              | String     | Lead trader ID (for copy trading)                                                                     |
| copyProfitRate            | BigDecimal | Copy trading profit share ratio                                                                       |
| copyProfit                | BigDecimal | Copy trading profit allocation                                                                        |
| updateTimes               | Long       | Number of updates                                                                                     |
| dbTime                    | Date       | Database update time                                                                                  |
| remark                    | String     | Remark                                                                                                |


**Response Example**:
```json
{
  "result": "true",
  "data": {
    "totalPage": 1,
    "hasNext": false,
    "page": {
      "symbol": null,
      "orderType": null,
      "sortColumn": null,
      "pageNo": 1,
      "openId": "de3afadd-840c-4112-845c-924d20ce7dfe",
      "loginUid": null,
      "start": 0,
      "pageSize": 20,
      "userType": "ALL",
      "sortDirect": null
    },
    "totalCount": 3,
    "resultList": [
      {
        "productid": "",
        "highestposition": 15,
        "longfrozen": 0,
        "copymemberid": "",
        "positionFaceValue": "56.5200",
        "userid": "lbank_exchange_user",
        "unrealprofit": -1.23,
        "frequency": 6,
        "exchangeid": "Exchange",
        "accountid": "de3afadd-840c-4112-845c-924d20ce7dfe",
        "closeprofit": 0,
        "productgroup": "SwapU",
        "preposition": 0,
        "isautoaddmargin": null,
        "inserttime": 1757007174,
        "instrumentid": "DOTUSDT",
        "openprice": 3.768,
        "liquidprice": null,
        "tptriggerprice": null,
        "frozenmargin": 0,
        "estimatedLiquidationPrice": "20.937",
        "clearcurrency": "USDT",
        "maintmargin": null,
        "pricecurrency": "USDT",
        "totalpositioncost": 56.52,
        "usemargin": 182.28710685,
        "position": 15,
        "lastopentime": null,
        "masteraccountid": "",
        "leverage": 1,
        "prelongfrozen": 0,
        "openId": "LBA2H70254",
        "remark": null,
        "costprice": 3.768,
        "preshortfrozen": 0,
        "userLevel": null,
        "positionid": "1000149871795545",
        "closeorderid": "",
        "sltriggerprice": null,
        "currency": "USDT",
        "longfrozenmargin": 0,
        "closeprice": null,
        "posidirection": "1",
        "createtime": "",
        "closeordersysid": "",
        "tradefee": 0,
        "settlementgroup": "SwapU",
        "updatetimes": 12,
        "begintime": 1757007223,
        "shortfrozenmargin": 0,
        "businessno": 1000712683183651,
        "positionfee": 0,
        "dbtime": 1757041205000,
        "tradeunitid": "de3afadd-840c-4112-8",
        "closeposition": 15,
        "positioncost": 56.52,
        "totalcloseprofit": 0,
        "iscrossmargin": 0,
        "copyprofit": 0,
        "copyprofitrate": null,
        "shortfrozen": 0,
        "updatetime": 1757007223,
        "memberid": "de3afadd-840c-4112-845c-924d20ce7dfe"
      }
    ]
  },
  "error_code": 0,
  "ts": 1757065894113
}
```

## Futures Current Orders - Regular Orders
`Rate Limit: 5 times/10s`

`GET `  `/affiliate-api/v2/future/orderPage`

**Request Parameters**:

| Parameter Name | Type   | Required | Description                                            |
|-----------------|--------|-------|-----------------------------------------------|
| openId         | String | true     | openId                                                                          |
| dealType       | String | true     | Trade type: 0-Market, 4-Limit                                                   |
| symbol         | String | false    | Trading pair                                                                    |
| startTime      | Long   | true     | Start time                                                                      |
| endTime        | Long   | true     | End time                                                                        |
| loginUid       | String | false    | Login user UID                                                                  |
| orderType      | int    | false    | Order type: 1-Regular Order, 2-Position Coupon Order                            |
| start          | int    | true     | Query start position, default is 0. For next page, pass value as start+pageSize |
| pageSize       | int    | true     | Number of records (max 100)                                                     |


**Response Parameters**:

| Parameter Name    | Type       | Description                                   |
|-------------------|------------|-------------------------------------|
| openId            | String     | User ID                                                                                    |
| remark            | String     | User remark                                                                                |
| userLevel         | int        | Level (1–20: Agent Levels 1–10, 0: Invitee, 99: Direct Referral, 100: Individual Customer) |
| memberid          | String     | Member code                                                                                |
| tradeunitid       | String     | Trade unit code                                                                            |
| exchangeid        | String     | Exchange code                                                                              |
| localid           | String     | Local order identifier                                                                     |
| instrumentid      | String     | Instrument code                                                                            |
| orderpricetype    | String     | Order price type                                                                           |
| direction         | String     | Side (0: Buy; 1: Sell)                                                                     |
| offsetflag        | String     | Open/Close flag                                                                            |
| price             | String     | Order price                                                                                |
| volume            | BigDecimal | Quantity                                                                                   |
| volumedisplay     | BigDecimal | Display quantity                                                                           |
| volumemode        | String     | Quantity mode (0: Percentage; 1: Absolute)                                                 |
| cost              | String     | Order amount                                                                               |
| ordertype         | String     | Order type                                                                                 |
| timecondition     | String     | Time condition                                                                             |
| gtdtime           | Long       | GTD time                                                                                   |
| minvolume         | BigDecimal | Minimum fill quantity                                                                      |
| businesstype      | String     | Business type                                                                              |
| businessvalue     | String     | Business value                                                                             |
| closeorderid      | String     | Closing order ID                                                                           |
| iscrossmargin     | BigDecimal | Cross margin or not                                                                        |
| orderid           | String     | Order ID                                                                                   |
| positionid        | String     | Position ID                                                                                |
| orderstatus       | String     | Order status                                                                               |
| derivesource      | String     | Derivation source                                                                          |
| derivedetail      | String     | Derivation detail                                                                          |
| volumetraded      | BigDecimal | Traded quantity                                                                            |
| volumeremain      | BigDecimal | Remaining quantity                                                                         |
| volumecancled     | BigDecimal | Canceled quantity                                                                          |
| inserttime        | Long       | Insert time                                                                                |
| updatetime        | Long       | Update time                                                                                |
| priority          | Integer    | Priority                                                                                   |
| timesortno        | Long       | Queue sequence by time                                                                     |
| frontno           | Integer    | Front number                                                                               |
| sessionno         | Integer    | Session number                                                                             |
| currency          | String     | Currency                                                                                   |
| pricecurrency     | String     | Quote currency                                                                             |
| clearcurrency     | String     | Settlement currency                                                                        |
| feecurrency       | String     | Fee currency                                                                               |
| frozenmoney       | String     | Frozen funds                                                                               |
| frozenfee         | String     | Frozen fees                                                                                |
| frozenmargin      | String     | Frozen margin                                                                              |
| fee               | BigDecimal | Transaction fee                                                                            |
| closeprofit       | String     | Close profit/loss                                                                          |
| turnover          | String     | Turnover                                                                                   |
| leverage          | BigDecimal | Leverage                                                                                   |
| relatedordersysid | String     | Related system order ID                                                                    |
| relatedorderid    | String     | Related order ID                                                                           |
| businessresult    | String     | Business result                                                                            |
| businessno        | Long       | Business serial number                                                                     |
| triggerprice      | String     | Trigger price                                                                              |
| tradable          | Integer    | Whether tradable                                                                           |
| settlementgroup   | String     | Settlement group ID                                                                        |
| appid             | String     | Application ID                                                                             |
| productid         | String     | Product ID                                                                                 |
| productgroup      | String     | Product group                                                                              |
| matchgroup        | Integer    | Match group                                                                                |
| posidirection     | String     | Position direction (0: Long; 1: Short; 2: Net)                                             |
| tradeprice        | String     | Average trade price                                                                        |
| openprice         | BigDecimal | Opening average price when closing                                                         |
| triggerorderid    | String     | Trigger order ID                                                                           |
| sltriggerprice    | String     | Stop-loss trigger price after open order executed                                          |
| tptriggerprice    | BigDecimal | Take-profit trigger price after open order executed                                        |
| lastpricebyinsert | String     | Last price at insert                                                                       |
| bidprice1byinsert | String     | Best bid at insert                                                                         |
| askprice1byinsert | String     | Best ask at insert                                                                         |
| implysortno       | Long       | Implicit sequence                                                                          |
| updatetimes       | Long       | Update count                                                                               |
| masteraccountid   | String     | Master account ID                                                                          |
| ddlntime          | String     | Valid until                                                                                |
| positionType      | Integer    | Position type                                                                              |

**Response Parameters**:

```json
{
  "result": "true",
  "data": {
    "totalPage": 1,
    "hasNext": false,
    "page": {
      "symbol": null,
      "orderType": 1,
      "sortColumn": null,
      "pageNo": 1,
      "openId": "LBA7H59367",
      "loginUid": null,
      "start": 0,
      "pageSize": 20,
      "startTime": 1756264801248,
      "endTime": 1756698537833,
      "dealType": "0",
      "sortDirect": null
    },
    "totalCount": 1,
    "resultList": [
      {
        "volumecancled": 0,
        "orderstatus": "4",
        "productid": null,
        "positionType": 1,
        "relatedorderid": null,
        "fee": "0",
        "userid": "lbank_exchange_user",
        "businessresult": "",
        "businesstype": "P",
        "exchangeid": "Exchange",
        "accountid": "b45f6029-ecfe-458c-83c8-d9cac4ae7d62",
        "closeprofit": "0",
        "price": "5.9",
        "derivesource": "0",
        "productgroup": "SwapU",
        "implysortno": 0,
        "inserttime": 1756277334,
        "instrumentid": "DOTUSDT",
        "openprice": null,
        "ordersysid": "1000149871691442",
        "frozenfee": "2.95",
        "triggerorderid": "",
        "tptriggerprice": null,
        "frozenmargin": "536.3636363636",
        "priority": 100,
        "frozenmoney": "0",
        "gtdtime": null,
        "clearcurrency": "USDT",
        "volume": 1000,
        "pricecurrency": "USDT",
        "tradable": 1,
        "ddlntime": null,
        "volumemode": "1",
        "frontno": -60,
        "ordertype": "0",
        "masteraccountid": "",
        "askprice1byinsert": "5.2",
        "leverage": 11,
        "orderpricetype": "0",
        "triggerprice": null,
        "openId": "LBA7H59367",
        "matchgroup": null,
        "volumeremain": 1000,
        "remark": null,
        "relatedordersysid": "",
        "timecondition": "0",
        "offsetflag": "0",
        "userLevel": null,
        "lastpricebyinsert": "5.2",
        "positionid": "1000149871690633",
        "closeorderid": "",
        "derivedetail": "",
        "sltriggerprice": null,
        "currency": "USDT",
        "turnover": "0",
        "bidprice1byinsert": "0",
        "direction": "1",
        "posidirection": "1",
        "tradeprice": null,
        "cost": null,
        "orderid": null,
        "settlementgroup": "SwapU",
        "updatetimes": 0,
        "localid": "5c4fbc470ea64c29a3af",
        "sessionno": 77355,
        "timesortno": 1000699855553778,
        "businessno": 1000712672399921,
        "volumetraded": 0,
        "feecurrency": "USDT",
        "tradeunitid": "b45f6029-ecfe-458c-8",
        "appid": "WEB",
        "businessvalue": "1756277334951",
        "iscrossmargin": 1,
        "minvolume": 0,
        "updatetime": 1756277334,
        "volumedisplay": null,
        "memberid": "b45f6029-ecfe-458c-83c8-d9cac4ae7d62"
      }
    ]
  },
  "error_code": 0,
  "ts": 1757381795110
}
```

## Futures Current Order - Planned Order

`Frequency Limit: 5 requests/10s`

`GET `  `/affiliate-api/v2/future/triggerOrderPage`

**Request Parameters**:

| Parameter Name       | Parameter Type | Required | Description                                            |
|-----------------|--------|-------|-----------------------------------------------|
| openId               | String         | true     | User Open ID                                                               |
| dealType             | String         | false    | Order type: 0 - Market Price, 4 - Limit Price                              |
| symbol               | String         | false    | Trading Pair                                                               |
| orderTypeForFrontEnd | String         | false    | Order type: 3 - Planned Order, 12 - Take Profit/Stop Loss Order            |
| startTime            | Long           | true     | Start time                                                                 |
| endTime              | Long           | true     | End time                                                                   |
| loginUid             | String         | false    | Logged-in User UID                                                         |
| orderType            | int            | true     | Order type: 1 - Regular Order, 2 - Position Coupon Order                   |
| start                | int            | true     | Pagination start position, default 0. For next page, pass start + pageSize |
| pageSize             | int            | true     | Number of records to fetch (max 100)                                       |


**Response Parameters**:

| Parameter Name      | Parameter Type | Description                                   |
|-------------------|------------|-------------------------------------|
| openId              | String         | User ID                                                                                |
| remark              | String         | User's remarks                                                                         |
| userLevel           | int            | User level (1-20): Standard levels, 0: Invitee, 99: Referral, 100: Individual customer |
| ordersysid          | String         | Unique system identifier for the order                                                 |
| memberid            | String         | Member code                                                                            |
| tradeunitid         | String         | Trading unit identifier                                                                |
| accountid           | String         | Fund account ID                                                                        |
| userid              | String         | Trading user ID                                                                        |
| exchangeid          | String         | Exchange code                                                                          |
| localid             | String         | Local order identifier                                                                 |
| instrumentid        | String         | Instrument ID                                                                          |
| orderpricetype      | String         | Order price type                                                                       |
| direction           | String         | Buy/Sell direction (0: Buy, 1: Sell)                                                   |
| offsetflag          | String         | Open/Close flag                                                                        |
| price               | String         | Order price                                                                            |
| volume              | BigDecimal     | Volume                                                                                 |
| volumedisplay       | BigDecimal     | Displayed volume                                                                       |
| volumemode          | String         | Volume mode (0: Percentage; 1: Absolute value)                                         |
| cost                | String         | Order cost                                                                             |
| ordertype           | String         | Order type                                                                             |
| timecondition       | String         | Time condition (validity type)                                                         |
| gtdtime             | Long           | GTD (Good Till Date) expiration time                                                   |
| minvolume           | BigDecimal     | Minimum volume                                                                         |
| businesstype        | String         | Business type                                                                          |
| businessvalue       | String         | Business value                                                                         |
| closeorderid        | String         | Closing order ID related to the opening order                                          |
| iscrossmargin       | BigDecimal     | Whether cross-margin (full margin) is used                                             |
| orderid             | String         | Order ID                                                                               |
| positionid          | String         | Position ID                                                                            |
| slprice             | String         | Stop-loss price                                                                        |
| sltriggerprice      | String         | Stop-loss trigger price                                                                |
| tpprice             | String         | Take-profit price                                                                      |
| tptriggerprice      | String         | Take-profit trigger price                                                              |
| triggerprice        | BigDecimal     | Trigger price                                                                          |
| riskbefore          | Integer        | Whether risk is checked in advance                                                     |
| triggerordertype    | String         | Triggered order type                                                                   |
| triggerdetail       | String         | Trigger type details                                                                   |
| triggerpricetype    | String         | Trigger price type                                                                     |
| triggervalue        | String         | Specific trigger order settings                                                        |
| closeslprice        | String         | Closing stop-loss price                                                                |
| closesltriggerprice | String         | Closing stop-loss trigger price                                                        |
| closetpprice        | String         | Closing take-profit price                                                              |
| closetptriggerprice | String         | Closing take-profit trigger price                                                      |
| closeorderpricetype | String         | Closing order price type                                                               |
| closeprice          | String         | Closing price                                                                          |
| closetriggerprice   | String         | Closing trigger price                                                                  |
| relatedordersysid   | String         | Related order system ID                                                                |
| relatedorderid      | String         | Related order ID                                                                       |
| activetime          | Long           | Activation time                                                                        |
| triggertime         | Long           | Trigger time                                                                           |
| timesortno          | Long           | Sequence number based on time                                                          |
| triggerstatus       | String         | Trigger order status                                                                   |
| posidirection       | String         | Position long/short direction                                                          |
| productid           | String         | Product ID                                                                             |
| productgroup        | String         | Product group                                                                          |
| frontno             | Integer        | Front number                                                                           |
| sessionno           | Integer        | Session number                                                                         |
| appid               | String         | Application ID                                                                         |
| errorno             | String         | Error code                                                                             |
| errormsg            | String         | Error message                                                                          |
| leverage            | BigDecimal     | Leverage amount                                                                        |
| inserttime          | Long           | Insert time                                                                            |
| updatetime          | Long           | Update time                                                                            |
| businessno          | Long           | Business serial number                                                                 |
| updatetimes         | Long           | Update count                                                                           |
| masteraccountid     | String         | Master account fund ID                                                                 |
| ddlntime            | String         | Validity time                                                                          |
| positionType        | Integer        | Position type                                                                          |

**Response Example**:

```json
{
  "result": "true",
  "data": {
    "totalPage": 1,
    "hasNext": false,
    "page": {
      "symbol": null,
      "orderType": 1,
      "openId": "LBA0A32906",
      "start": 0,
      "pageSize": 20,
      "dealType": null,
      "orderTypeForFrontEnd": null,
      "sortDirect": null,
      "sortColumn": null,
      "pageNo": 1,
      "loginUid": null,
      "startTime": 1756260744314,
      "endTime": 1756974032054
    },
    "totalCount": 1,
    "resultList": [
      {
        "productid": null,
        "positionType": 1,
        "relatedorderid": null,
        "slprice": null,
        "closesltriggerprice": null,
        "triggerpricetype": "0",
        "closetriggerprice": null,
        "userid": "lbank_exchange_user",
        "businesstype": "0",
        "exchangeid": "Exchange",
        "accountid": "324c527f-742b-4cc7-8b69-9622de8b3c9b",
        "errorno": null,
        "price": "300",
        "productgroup": "SwapU",
        "triggervalue": "",
        "tpprice": "300",
        "inserttime": 1756974032,
        "instrumentid": "BTCUSDT",
        "ordersysid": "1000149871720174",
        "tptriggerprice": "200",
        "closeslprice": null,
        "riskbefore": 0,
        "triggerdetail": "",
        "triggerstatus": "1",
        "gtdtime": null,
        "volume": 2,
        "activetime": null,
        "closeorderpricetype": "",
        "closetpprice": null,
        "ddlntime": "0",
        "volumemode": "1",
        "frontno": null,
        "ordertype": "0",
        "masteraccountid": "",
        "leverage": 200,
        "orderpricetype": "0",
        "triggerprice": 200,
        "openId": "LBA0A32906",
        "remark": null,
        "triggerordertype": "3",
        "relatedordersysid": "",
        "errormsg": "",
        "timecondition": "0",
        "closetptriggerprice": null,
        "offsetflag": "0",
        "userLevel": null,
        "positionid": "",
        "closeorderid": "",
        "sltriggerprice": null,
        "closeprice": null,
        "direction": "0",
        "posidirection": "0",
        "cost": null,
        "orderid": null,
        "updatetimes": 0,
        "localid": "",
        "sessionno": null,
        "timesortno": 0,
        "businessno": null,
        "tradeunitid": "324c527f-742b-4cc7-8",
        "appid": "WEB",
        "businessvalue": "",
        "iscrossmargin": 1,
        "minvolume": null,
        "updatetime": 1756974032,
        "triggertime": null,
        "volumedisplay": null,
        "memberid": "324c527f-742b-4cc7-8b69-9622de8b3c9b"
      }
    ]
  },
  "error_code": 0,
  "ts": 1757420772093
}
```

## Futures History Order - Regular Order
`Frequency Limit: 5 requests/10s`

`GET `  `/affiliate-api/v2/future/finishOrderPage`

**Request Parameters**:

| Parameter Name | Parameter Type | Required | Description                                                                |
| -------------- | -------------- | -------- | -------------------------------------------------------------------------- |
| openId         | String         | true     | User Open ID                                                               |
| dealType       | String         | false    | Order type: 0 - Market Price, 4 - Limit Price                              |
| symbol         | String         | false    | Trading Pair                                                               |
| startTime      | Long           | true     | Start time                                                                 |
| endTime        | Long           | true     | End time                                                                   |
| loginUid       | String         | false    | Logged-in User UID                                                         |
| orderType      | int            | true     | Order type: 1 - Regular Order, 2 - Position Coupon Order                   |
| start          | int            | true     | Pagination start position, default 0. For next page, pass start + pageSize |
| pageSize       | int            | true     | Number of records to fetch (max 100)                                       |

**Response Parameters**:

| Parameter Name    | Parameter Type | Description                                                                            |
| ----------------- | -------------- | -------------------------------------------------------------------------------------- |
| openId            | String         | User ID                                                                                |
| remark            | String         | User's remarks                                                                         |
| userLevel         | int            | User level (1-20): Standard levels, 0: Invitee, 99: Referral, 100: Individual customer |
| ordersysid        | String         | Unique system identifier for the order                                                 |
| memberid          | String         | Member code                                                                            |
| tradeunitid       | String         | Trading unit identifier                                                                |
| accountid         | String         | Fund account ID                                                                        |
| userid            | String         | Trading user ID                                                                        |
| exchangeid        | String         | Exchange code                                                                          |
| localid           | String         | Local order identifier                                                                 |
| instrumentid      | String         | Instrument ID                                                                          |
| orderpricetype    | String         | Order price type                                                                       |
| direction         | String         | Buy/Sell direction (0: Buy, 1: Sell)                                                   |
| offsetflag        | String         | Open/Close flag                                                                        |
| price             | String         | Order price                                                                            |
| volume            | BigDecimal     | Volume                                                                                 |
| volumedisplay     | BigDecimal     | Displayed volume                                                                       |
| volumemode        | String         | Volume mode (0: Percentage; 1: Absolute value)                                         |
| cost              | String         | Order cost                                                                             |
| ordertype         | String         | Order type                                                                             |
| timecondition     | String         | Time condition (validity type)                                                         |
| gtdtime           | Long           | GTD (Good Till Date) expiration time                                                   |
| minvolume         | BigDecimal     | Minimum volume                                                                         |
| businesstype      | String         | Business type                                                                          |
| businessvalue     | String         | Business value                                                                         |
| closeorderid      | String         | Closing order ID related to the opening order                                          |
| copymemberid      | String         | Copy trader ID                                                                         |
| copyorderid       | String         | Copy trader order ID                                                                   |
| copyprofitrate    | BigDecimal     | Copy trader profit share rate                                                          |
| positionid        | String         | Position ID                                                                            |
| orderstatus       | String         | Order status                                                                           |
| iscrossmargin     | BigDecimal     | Whether cross-margin (full margin) is used                                             |
| orderid           | String         | Order ID                                                                               |
| derivesource      | String         | Derivation source                                                                      |
| derivedetail      | String         | Derivation details                                                                     |
| volumetraded      | BigDecimal     | Volume traded                                                                          |
| volumeremain      | BigDecimal     | Remaining volume                                                                       |
| volumecancelled   | BigDecimal     | Cancelled volume                                                                       |
| inserttime        | Long           | Insert time                                                                            |
| updatetime        | Long           | Update time                                                                            |
| priority          | Integer        | Priority                                                                               |
| timesortno        | Long           | Sequence number based on time                                                          |
| frontno           | Integer        | Front number                                                                           |
| sessionno         | Integer        | Session number                                                                         |
| currency          | String         | Currency                                                                               |
| pricecurrency     | String         | Pricing currency                                                                       |
| clearcurrency     | String         | Clearing currency                                                                      |
| feecurrency       | String         | Fee currency                                                                           |
| frozenmoney       | String         | Frozen funds                                                                           |
| frozenfee         | String         | Frozen fee                                                                             |
| frozenmargin      | String         | Frozen margin                                                                          |
| fee               | BigDecimal     | Fee amount                                                                             |
| closeprofit       | String         | Close profit/loss                                                                      |
| turnover          | String         | Turnover                                                                               |
| relatedordersysid | String         | Related order system ID                                                                |
| businessresult    | String         | Business result                                                                        |
| businessno        | Long           | Business serial number                                                                 |
| triggerprice      | String         | Trigger price                                                                          |
| tradable          | Integer        | Whether the order is tradable                                                          |
| settlementgroup   | String         | Settlement group ID                                                                    |
| appid             | String         | Application ID                                                                         |
| productid         | String         | Product ID                                                                             |
| productgroup      | String         | Product group                                                                          |
| matchgroup        | Integer        | Match group                                                                            |
| posidirection     | String         | Position long/short direction                                                          |
| tradeprice        | String         | Average trade price                                                                    |
| openprice         | BigDecimal     | Average open price at the time of closing                                              |
| triggerorderid    | String         | Triggered order ID                                                                     |
| sltriggerprice    | String         | Stop-loss trigger price after opening order                                            |
| tptriggerprice    | BigDecimal     | Take-profit trigger price after opening order                                          |
| copyprofit        | BigDecimal     | Copy trader profit distribution                                                        |
| lastpricebyinsert | BigDecimal     | Last price at the time of order insertion                                              |
| bidprice1byinsert | String         | Best bid price at the time of insertion                                                |
| askprice1byinsert | String         | Best ask price at the time of insertion                                                |
| implysortno       | Long           | Implicit sorting order in derivation process                                           |
| masteraccountid   | String         | Master account fund ID                                                                 |


**Response Example:**

```json
{
  "result": "true",
  "data": {
    "totalPage": 1,
    "hasNext": false,
    "page": {
      "symbol": null,
      "orderType": 1,
      "sortColumn": null,
      "pageNo": 1,
      "openId": "b98c3596-97c8-41f4-b4d7-f3de24d310f5",
      "loginUid": null,
      "start": 0,
      "pageSize": 20,
      "startTime": 1740705215000,
      "endTime": 1742467648000,
      "dealType": "0",
      "sortDirect": null
    },
    "totalCount": 2,
    "resultList": [
      {
        "volumecancled": 0,
        "orderstatus": "1",
        "productid": "",
        "relatedorderid": null,
        "fee": "0.0233392500",
        "userid": "",
        "businessresult": "",
        "businesstype": "0",
        "exchangeid": "Exchange",
        "accountid": "b98c3596-97c8-41f4-b4d7-f3de24d310f5",
        "closeprofit": "-12.1825000000",
        "price": "4.243500000000000",
        "derivesource": "0",
        "productgroup": "SwapU",
        "implysortno": 0,
        "inserttime": 1741087475,
        "instrumentid": "DOTUSDT",
        "openprice": "5.351000000000000",
        "ordersysid": "1000149068902910",
        "frozenfee": "0E-10",
        "triggerorderid": "",
        "tptriggerprice": null,
        "frozenmargin": "0E-10",
        "priority": 100,
        "frozenmoney": "0E-10",
        "gtdtime": null,
        "clearcurrency": "USDT",
        "volume": 11,
        "pricecurrency": "USDT",
        "tradable": 1,
        "volumemode": "1",
        "frontno": null,
        "ordertype": "0",
        "askprice1byinsert": "0E-15",
        "leverage": 125,
        "orderpricetype": "0",
        "triggerprice": null,
        "openId": "LBA0H13928",
        "matchgroup": null,
        "volumeremain": 0,
        "remark": null,
        "relatedordersysid": "",
        "timecondition": "0",
        "offsetflag": "8",
        "userLevel": 3,
        "lastpricebyinsert": "4.243500000000000",
        "positionid": "1000148797460621",
        "closeorderid": "",
        "derivedetail": "",
        "sltriggerprice": null,
        "currency": "USDT",
        "turnover": "46.6785000000",
        "bidprice1byinsert": "4.243500000000000",
        "direction": "1",
        "posidirection": "0",
        "tradeprice": "4.243500000000000",
        "createtime": 1741058675000,
        "cost": null,
        "orderid": null,
        "settlementgroup": "SwapU",
        "localid": "1000149068902910",
        "sessionno": 0,
        "timesortno": 1000699278940125,
        "businessno": 1000710594996498,
        "volumetraded": 11,
        "feecurrency": "USDT",
        "tradeunitid": "b98c3596-97c8-41f4-b",
        "appid": "",
        "businessvalue": "",
        "iscrossmargin": 1,
        "minvolume": 0,
        "updatetime": 1741087475,
        "volumedisplay": null,
        "memberid": "b98c3596-97c8-41f4-b4d7-f3de24d310f5"
      }
    ]
  },
  "error_code": 0,
  "ts": 1757493599163
}
```

## Futures History Order - Plan/Take-Profit & Stop-Loss Order
`Frequency Limit: 5 requests/10s`

`GET `  `/affiliate-api/v2/future/finishTriggerOrderPage`

**Request Parameters**:

| Parameter Name       | Parameter Type | Required | Description                                                           |
| -------------------- | -------------- | -------- | --------------------------------------------------------------------- |
| openId               | String         | true     | User Open ID                                                          |
| dealType             | String         | false    | Order type: 0 - Market Price, 4 - Limit Price                         |
| symbol               | String         | false    | Trading Pair                                                          |
| orderTypeForFrontEnd | String         | false    | Order type: 3 - Plan Order, 12 - Take-Profit & Stop-Loss Order        |
| startTime            | Long           | true     | Start time                                                            |
| endTime              | Long           | true     | End time                                                              |
| loginUid             | String         | false    | Logged-in User UID                                                    |
| orderType            | int            | true     | Order type: 1 - Regular Order, 2 - Position Coupon Order              |
| start                | int            | true     | Query start position, default 0. For next page, pass start + pageSize |
| pageSize             | int            | true     | Number of records to fetch (max 100)                                  |


**Response Parameters**:

| Parameter Name      | Parameter Type | Description                                                                         |
| ------------------- | -------------- | ----------------------------------------------------------------------------------- |
| openId              | String         | User ID                                                                             |
| remark              | String         | User's remarks                                                                      |
| userLevel           | int            | User level (1-20): Standard levels, 0: Direct client, 99: Invited user, 100: Retail |
| ordersysid          | String         | Unique system identifier for the order                                              |
| memberid            | String         | Member code                                                                         |
| tradeunitid         | String         | Trading unit ID                                                                     |
| accountid           | String         | Fund account ID                                                                     |
| userid              | String         | Trading user ID                                                                     |
| exchangeid          | String         | Exchange ID                                                                         |
| localid             | String         | Local order identifier                                                              |
| instrumentid        | String         | Instrument ID                                                                       |
| orderpricetype      | String         | Order price type                                                                    |
| direction           | String         | Buy/Sell direction (0: Buy, 1: Sell)                                                |
| offsetflag          | String         | Open/Close flag                                                                     |
| price               | String         | Order price                                                                         |
| volume              | BigDecimal     | Volume                                                                              |
| volumedisplay       | BigDecimal     | Displayed volume                                                                    |
| volumemode          | String         | Volume mode (0: Percentage; 1: Absolute value)                                      |
| cost                | String         | Order cost                                                                          |
| ordertype           | String         | Order type                                                                          |
| timecondition       | String         | Validity type                                                                       |
| gtdtime             | Long           | GTD (Good Till Date) expiration time                                                |
| minvolume           | BigDecimal     | Minimum volume                                                                      |
| businesstype        | String         | Business type                                                                       |
| businessvalue       | String         | Business value                                                                      |
| closeorderid        | String         | Closing order ID linked to the opening order                                        |
| copymemberid        | String         | Copy trader ID                                                                      |
| copyorderid         | String         | Copy trader order ID                                                                |
| copyprofitrate      | String         | Copy trader profit share rate                                                       |
| leverage            | String         | Leverage of the order                                                               |
| positionid          | String         | Position ID                                                                         |
| slprice             | String         | Stop-loss price                                                                     |
| sltriggerprice      | String         | Stop-loss trigger price                                                             |
| tpprice             | String         | Take-profit price                                                                   |
| tptriggerprice      | String         | Take-profit trigger price                                                           |
| triggerprice        | BigDecimal     | Trigger price                                                                       |
| riskbefore          | Integer        | Whether to check risk in advance                                                    |
| triggerordertype    | String         | Triggered order type                                                                |
| triggerdetail       | String         | Trigger details                                                                     |
| triggerpricetype    | String         | Trigger price type                                                                  |
| triggervalue        | String         | Trigger order specific settings                                                     |
| closeslprice        | String         | Close stop-loss price                                                               |
| closesltriggerprice | String         | Close stop-loss trigger price                                                       |
| closetpprice        | String         | Close take-profit price                                                             |
| closetptriggerprice | String         | Close take-profit trigger price                                                     |
| closeorderpricetype | String         | Close order price type                                                              |
| closeprice          | String         | Close price                                                                         |
| closetriggerprice   | String         | Close trigger price                                                                 |
| relatedordersysid   | String         | Related order system ID                                                             |
| relatedorderid      | String         | Related order ID                                                                    |
| activetime          | Long           | Activation time                                                                     |
| triggertime         | Long           | Trigger time                                                                        |
| timesortno          | Long           | Sequence number based on time                                                       |
| triggerstatus       | String         | Trigger order status                                                                |
| posidirection       | String         | Position long/short direction                                                       |
| productid           | String         | Product ID                                                                          |
| productgroup        | String         | Product group                                                                       |
| frontno             | Integer        | Front number                                                                        |
| sessionno           | Integer        | Session number                                                                      |
| appid               | String         | Application ID                                                                      |
| errorno             | String         | Error code                                                                          |
| errormsg            | String         | Error message                                                                       |
| inserttime          | Long           | Insert time                                                                         |
| updatetime          | Long           | Update time                                                                         |
| businessno          | Long           | Business serial number                                                              |
| masteraccountid     | String         | Master account fund ID                                                              |


**Response Example**:

```json
{
  "result": "true",
  "data": {
    "totalPage": 1,
    "hasNext": false,
    "page": {
      "symbol": null,
      "orderType": 1,
      "openId": "1f8f43df-218c-4bfd-8e21-2b2a16e42379",
      "start": 0,
      "pageSize": 20,
      "dealType": "0",
      "orderTypeForFrontEnd": null,
      "sortDirect": null,
      "sortColumn": null,
      "pageNo": 1,
      "loginUid": null,
      "startTime": 1752733121542,
      "endTime": 1752733144872
    },
    "totalCount": 2,
    "resultList": [
      {
        "productid": "",
        "relatedorderid": null,
        "slprice": "56.080000000000000",
        "closesltriggerprice": null,
        "triggerpricetype": "0",
        "closetriggerprice": null,
        "userid": "lbank_exchange_user",
        "businesstype": "0",
        "exchangeid": "Exchange",
        "accountid": "1f8f43df-218c-4bfd-8e21-2b2a16e42379",
        "errorno": null,
        "price": "56.080000000000000",
        "productgroup": "SwapU",
        "triggervalue": "",
        "tpprice": null,
        "inserttime": 1752733144,
        "instrumentid": "CAPUSDT",
        "ordersysid": "1000149819273687",
        "tptriggerprice": null,
        "closeslprice": null,
        "riskbefore": 0,
        "triggerdetail": "",
        "triggerstatus": "4",
        "gtdtime": null,
        "volume": 0.1,
        "activetime": null,
        "closeorderpricetype": "",
        "closetpprice": null,
        "volumemode": "1",
        "frontno": null,
        "ordertype": "0",
        "leverage": 125,
        "orderpricetype": "0",
        "triggerprice": "56.000000000000000",
        "openId": "LBA5H25419",
        "remark": null,
        "triggerordertype": "3",
        "relatedordersysid": "",
        "errormsg": "",
        "timecondition": "0",
        "closetptriggerprice": null,
        "offsetflag": "0",
        "userLevel": 2,
        "positionid": "",
        "closeorderid": "",
        "sltriggerprice": "56.000000000000000",
        "closeprice": null,
        "direction": "1",
        "posidirection": "1",
        "createtime": 1752780088000,
        "cost": null,
        "orderid": null,
        "localid": "",
        "sessionno": null,
        "timesortno": 0,
        "businessno": 1000712465406914,
        "tradeunitid": "1f8f43df-218c-4bfd-8",
        "appid": "WEB",
        "businessvalue": "",
        "iscrossmargin": 1,
        "minvolume": null,
        "updatetime": 1752808888,
        "triggertime": null,
        "volumedisplay": null,
        "memberid": "1f8f43df-218c-4bfd-8e21-2b2a16e42379"
      },
      {
        "productid": "",
        "relatedorderid": null,
        "slprice": null,
        "closesltriggerprice": null,
        "triggerpricetype": "0",
        "closetriggerprice": null,
        "userid": "lbank_exchange_user",
        "businesstype": "0",
        "exchangeid": "Exchange",
        "accountid": "1f8f43df-218c-4bfd-8e21-2b2a16e42379",
        "errorno": null,
        "price": "56.080000000000000",
        "productgroup": "SwapU",
        "triggervalue": "",
        "tpprice": "56.080000000000000",
        "inserttime": 1752733121,
        "instrumentid": "CAPUSDT",
        "ordersysid": "1000149819273082",
        "tptriggerprice": "56.080000000000000",
        "closeslprice": null,
        "riskbefore": 0,
        "triggerdetail": "",
        "triggerstatus": "4",
        "gtdtime": null,
        "volume": 0.1,
        "activetime": null,
        "closeorderpricetype": "",
        "closetpprice": null,
        "volumemode": "1",
        "frontno": null,
        "ordertype": "0",
        "leverage": 125,
        "orderpricetype": "0",
        "triggerprice": "56.080000000000000",
        "openId": "LBA5H25419",
        "remark": null,
        "triggerordertype": "3",
        "relatedordersysid": "",
        "errormsg": "",
        "timecondition": "0",
        "closetptriggerprice": null,
        "offsetflag": "0",
        "userLevel": 2,
        "positionid": "",
        "closeorderid": "",
        "sltriggerprice": null,
        "closeprice": null,
        "direction": "1",
        "posidirection": "1",
        "createtime": 1752704335000,
        "cost": null,
        "orderid": null,
        "localid": "",
        "sessionno": null,
        "timesortno": 0,
        "businessno": 1000712459386736,
        "tradeunitid": "1f8f43df-218c-4bfd-8",
        "appid": "WEB",
        "businessvalue": "",
        "iscrossmargin": 1,
        "minvolume": null,
        "updatetime": 1752733135,
        "triggertime": null,
        "volumedisplay": null,
        "memberid": "1f8f43df-218c-4bfd-8e21-2b2a16e42379"
      }
    ]
  },
  "error_code": 0,
  "ts": 1757495606894
}
```


## Query Remark Details

`Frequency Limit: 5 requests/10s`

`GET `  `/affiliate-api/v2/future/trade/remark`

**Request Parameters**:

| Parameter Name | Parameter Type | Required | Description                         |
| -------------- | -------------- | -------- | ----------------------------------- |
| tradeid        | String         | true     | Transaction ID                      |
| memberOpenId   | String         | true     | Trader's Open ID                    |
| dealTime       | Long           | false    | Transaction time                    |
| feecurrency    | String         | false    | Currency                            |
| rebateType     | String         | false    | 0: Spot, 1: Futures, 2: New Futures |
| tradeType      | String         | false    | Trade type: buy (buy), sell (sell)  |
| orderUuid      | String         | false    | Order ID                            |

**Response Parameters**:

| Parameter Name | Parameter Type | Description       |
| -------------- | -------------- | ----------------- |
| rebateRemark   | String         | Rebate remark     |
| rebateStatus   | int            | Rebate status     |
| rebateTime     | Long           | Rebate time       |
| feeGrants      | String         | Bonus             |
| feeCoupon      | String         | Fee discount card |
| feePosition    | String         | Position fee      |
| feeCal         | String         | Fee discount      |

**Response Example**:

```json
{
  "result": "true",
  "error_code": 0,
  "data": {
    "rebateRemark": "Query Remark Details",
    "rebateStatus": 1,
    "rebateTime": "1756277334000",
    "feeGrants": "15315.1597",
    "feeCoupon": "7.6575",
    "feePosition": "0",
    "feeCal": "0"
  },
  "ts": 1756978859965
}
```
