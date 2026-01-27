
import type { TypedAbiArg, TypedAbiFunction, TypedAbiMap, TypedAbiVariable, Response } from '@clarigen/core';

export const contracts = {
  blacklist: {
  "functions": {
    blacklistProcessor: {"name":"blacklist-processor","access":"private","args":[{"name":"entry","type":{"tuple":[{"name":"address","type":"principal"},{"name":"full","type":"bool"}]}}],"outputs":{"type":"bool"}} as TypedAbiFunction<[entry: TypedAbiArg<{
  "address": string;
  "full": boolean;
}, "entry">], boolean>,
    blacklistRemover: {"name":"blacklist-remover","access":"private","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    addBlacklist: {"name":"add-blacklist","access":"public","args":[{"name":"entries","type":{"list":{"type":{"tuple":[{"name":"address","type":"principal"},{"name":"full","type":"bool"}]},"length":1000}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":"bool","length":1000}},"error":"uint128"}}}} as TypedAbiFunction<[entries: TypedAbiArg<{
  "address": string;
  "full": boolean;
}[], "entries">], Response<boolean[], bigint>>,
    removeBlacklist: {"name":"remove-blacklist","access":"public","args":[{"name":"entries","type":{"list":{"type":"principal","length":1000}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":"bool","length":1000}},"error":"uint128"}}}} as TypedAbiFunction<[entries: TypedAbiArg<string[], "entries">], Response<boolean[], bigint>>,
    setBlacklister: {"name":"set-blacklister","access":"public","args":[{"name":"address","type":"principal"},{"name":"active","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, active: TypedAbiArg<boolean, "active">], Response<boolean, bigint>>,
    setFullBlacklistEnabled: {"name":"set-full-blacklist-enabled","access":"public","args":[{"name":"enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
    setSoftBlacklistEnabled: {"name":"set-soft-blacklist-enabled","access":"public","args":[{"name":"enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
    checkIsBlacklister: {"name":"check-is-blacklister","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    checkIsNotFull: {"name":"check-is-not-full","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    checkIsNotFullTwo: {"name":"check-is-not-full-two","access":"read_only","args":[{"name":"address1","type":"principal"},{"name":"address2","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address1: TypedAbiArg<string, "address1">, address2: TypedAbiArg<string, "address2">], Response<boolean, bigint>>,
    checkIsNotSoft: {"name":"check-is-not-soft","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    getBlacklister: {"name":"get-blacklister","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getFullBlacklist: {"name":"get-full-blacklist","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getFullBlacklistEnabled: {"name":"get-full-blacklist-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getSoftBlacklist: {"name":"get-soft-blacklist","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getSoftBlacklistEnabled: {"name":"get-soft-blacklist-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>
  },
  "maps": {
    blacklist: {"name":"blacklist","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"full","type":"bool"},{"name":"soft","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "full": boolean;
  "soft": boolean;
}>,
    blacklister: {"name":"blacklister","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"active","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "active": boolean;
}>
  },
  "variables": {
    ERR_FULLY_BLACKLISTED: {
  name: 'ERR_FULLY_BLACKLISTED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_BLACKLISTER: {
  name: 'ERR_NOT_BLACKLISTER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_SOFT_BLACKLISTED: {
  name: 'ERR_SOFT_BLACKLISTED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    fullBlacklistEnabled: {
  name: 'full-blacklist-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    softBlacklistEnabled: {
  name: 'soft-blacklist-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>
  },
  constants: {
  ERR_FULLY_BLACKLISTED: {
    isOk: false,
    value: 108_003n
  },
  ERR_NOT_BLACKLISTER: {
    isOk: false,
    value: 108_001n
  },
  ERR_SOFT_BLACKLISTED: {
    isOk: false,
    value: 108_002n
  },
  fullBlacklistEnabled: false,
  softBlacklistEnabled: true
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'blacklist',
  },
blacklistSusdh: {
  "functions": {
    blacklistProcessor: {"name":"blacklist-processor","access":"private","args":[{"name":"entry","type":{"tuple":[{"name":"address","type":"principal"},{"name":"full","type":"bool"}]}}],"outputs":{"type":"bool"}} as TypedAbiFunction<[entry: TypedAbiArg<{
  "address": string;
  "full": boolean;
}, "entry">], boolean>,
    blacklistRemover: {"name":"blacklist-remover","access":"private","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    addBlacklist: {"name":"add-blacklist","access":"public","args":[{"name":"entries","type":{"list":{"type":{"tuple":[{"name":"address","type":"principal"},{"name":"full","type":"bool"}]},"length":1000}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":"bool","length":1000}},"error":"uint128"}}}} as TypedAbiFunction<[entries: TypedAbiArg<{
  "address": string;
  "full": boolean;
}[], "entries">], Response<boolean[], bigint>>,
    removeBlacklist: {"name":"remove-blacklist","access":"public","args":[{"name":"entries","type":{"list":{"type":"principal","length":1000}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":"bool","length":1000}},"error":"uint128"}}}} as TypedAbiFunction<[entries: TypedAbiArg<string[], "entries">], Response<boolean[], bigint>>,
    setBlacklister: {"name":"set-blacklister","access":"public","args":[{"name":"address","type":"principal"},{"name":"active","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, active: TypedAbiArg<boolean, "active">], Response<boolean, bigint>>,
    setFullBlacklistEnabled: {"name":"set-full-blacklist-enabled","access":"public","args":[{"name":"active","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[active: TypedAbiArg<boolean, "active">], Response<boolean, bigint>>,
    setSoftBlacklistEnabled: {"name":"set-soft-blacklist-enabled","access":"public","args":[{"name":"active","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[active: TypedAbiArg<boolean, "active">], Response<boolean, bigint>>,
    checkIsBlacklister: {"name":"check-is-blacklister","access":"read_only","args":[{"name":"contract","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[contract: TypedAbiArg<string, "contract">], Response<boolean, bigint>>,
    checkIsNotFullBlacklist: {"name":"check-is-not-full-blacklist","access":"read_only","args":[{"name":"contract","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[contract: TypedAbiArg<string, "contract">], Response<boolean, bigint>>,
    checkIsNotFullBlacklistTwo: {"name":"check-is-not-full-blacklist-two","access":"read_only","args":[{"name":"contract1","type":"principal"},{"name":"contract2","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[contract1: TypedAbiArg<string, "contract1">, contract2: TypedAbiArg<string, "contract2">], Response<boolean, bigint>>,
    checkIsNotSoftBlacklist: {"name":"check-is-not-soft-blacklist","access":"read_only","args":[{"name":"contract","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[contract: TypedAbiArg<string, "contract">], Response<boolean, bigint>>,
    getBlacklister: {"name":"get-blacklister","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getFullBlacklist: {"name":"get-full-blacklist","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getFullBlacklistEnabled: {"name":"get-full-blacklist-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getSoftBlacklist: {"name":"get-soft-blacklist","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getSoftBlacklistEnabled: {"name":"get-soft-blacklist-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>
  },
  "maps": {
    blacklist: {"name":"blacklist","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"full","type":"bool"},{"name":"soft","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "full": boolean;
  "soft": boolean;
}>,
    blacklister: {"name":"blacklister","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"active","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "active": boolean;
}>
  },
  "variables": {
    ERR_FULLY_BLACKLISTED: {
  name: 'ERR_FULLY_BLACKLISTED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_BLACKLISTER: {
  name: 'ERR_NOT_BLACKLISTER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_SOFT_BLACKLISTED: {
  name: 'ERR_SOFT_BLACKLISTED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    fullBlacklistEnabled: {
  name: 'full-blacklist-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    softBlacklistEnabled: {
  name: 'soft-blacklist-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>
  },
  constants: {
  ERR_FULLY_BLACKLISTED: {
    isOk: false,
    value: 6_003n
  },
  ERR_NOT_BLACKLISTER: {
    isOk: false,
    value: 6_001n
  },
  ERR_SOFT_BLACKLISTED: {
    isOk: false,
    value: 6_002n
  },
  fullBlacklistEnabled: true,
  softBlacklistEnabled: true
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch25","clarity_version":"Clarity2",
  contractName: 'blacklist-susdh',
  },
controller: {
  "functions": {
    logReward: {"name":"log-reward","access":"public","args":[{"name":"reward-usdh","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[rewardUsdh: TypedAbiArg<number | bigint, "rewardUsdh">], Response<boolean, bigint>>,
    setMaxRewardPerWindow: {"name":"set-max-reward-per-window","access":"public","args":[{"name":"new-max-reward-per-window","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newMaxRewardPerWindow: TypedAbiArg<number | bigint, "newMaxRewardPerWindow">], Response<boolean, bigint>>,
    setRewarder: {"name":"set-rewarder","access":"public","args":[{"name":"address","type":"principal"},{"name":"active","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, active: TypedAbiArg<boolean, "active">], Response<boolean, bigint>>,
    setUpdateWindow: {"name":"set-update-window","access":"public","args":[{"name":"new-update-window","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newUpdateWindow: TypedAbiArg<number | bigint, "newUpdateWindow">], Response<boolean, bigint>>,
    checkIsRewarder: {"name":"check-is-rewarder","access":"read_only","args":[{"name":"contract","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[contract: TypedAbiArg<string, "contract">], Response<boolean, bigint>>,
    getLastLogBlockHeight: {"name":"get-last-log-block-height","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMaxRewardPerWindow: {"name":"get-max-reward-per-window","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getRewarder: {"name":"get-rewarder","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getUpdateWindow: {"name":"get-update-window","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>
  },
  "maps": {
    rewarders: {"name":"rewarders","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"active","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "active": boolean;
}>
  },
  "variables": {
    ERR_ABOVE_MAX: {
  name: 'ERR_ABOVE_MAX',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_BELOW_MIN: {
  name: 'ERR_BELOW_MIN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_REWARDER: {
  name: 'ERR_NOT_REWARDER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_UPDATE_WINDOW_CLOSED: {
  name: 'ERR_UPDATE_WINDOW_CLOSED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    bpsBase: {
  name: 'bps-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    maxReward: {
  name: 'max-reward',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    minUpdateWindow: {
  name: 'min-update-window',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    lastLogBlockHeight: {
  name: 'last-log-block-height',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    maxRewardPerWindow: {
  name: 'max-reward-per-window',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    updateWindow: {
  name: 'update-window',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>
  },
  constants: {
  ERR_ABOVE_MAX: {
    isOk: false,
    value: 5_003n
  },
  ERR_BELOW_MIN: {
    isOk: false,
    value: 5_004n
  },
  ERR_NOT_REWARDER: {
    isOk: false,
    value: 5_001n
  },
  ERR_UPDATE_WINDOW_CLOSED: {
    isOk: false,
    value: 5_002n
  },
  bpsBase: 10_000n,
  lastLogBlockHeight: 914_850n,
  maxReward: 20n,
  maxRewardPerWindow: 10n,
  minUpdateWindow: 36n,
  updateWindow: 84n
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch25","clarity_version":"Clarity2",
  contractName: 'controller',
  },
controllerHbtc: {
  "functions": {
    getSbtcBalance: {"name":"get-sbtc-balance","access":"private","args":[{"name":"contract","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[contract: TypedAbiArg<string, "contract">], bigint>,
    handleLossCovered: {"name":"handle-loss-covered","access":"private","args":[{"name":"reward","type":"uint128"},{"name":"is-positive","type":"bool"},{"name":"total-rf","type":"uint128"},{"name":"pending-rf","type":"uint128"},{"name":"mgmt-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[reward: TypedAbiArg<number | bigint, "reward">, isPositive: TypedAbiArg<boolean, "isPositive">, totalRf: TypedAbiArg<number | bigint, "totalRf">, pendingRf: TypedAbiArg<number | bigint, "pendingRf">, mgmtFee: TypedAbiArg<number | bigint, "mgmtFee">], Response<boolean, bigint>>,
    handleLossExceeds: {"name":"handle-loss-exceeds","access":"private","args":[{"name":"reward","type":"uint128"},{"name":"is-positive","type":"bool"},{"name":"total-rf","type":"uint128"},{"name":"pending-rf","type":"uint128"},{"name":"req-rf","type":"uint128"},{"name":"perf-fee","type":"uint128"},{"name":"mgmt-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[reward: TypedAbiArg<number | bigint, "reward">, isPositive: TypedAbiArg<boolean, "isPositive">, totalRf: TypedAbiArg<number | bigint, "totalRf">, pendingRf: TypedAbiArg<number | bigint, "pendingRf">, reqRf: TypedAbiArg<number | bigint, "reqRf">, perfFee: TypedAbiArg<number | bigint, "perfFee">, mgmtFee: TypedAbiArg<number | bigint, "mgmtFee">], Response<boolean, bigint>>,
    handleProfit: {"name":"handle-profit","access":"private","args":[{"name":"reward","type":"uint128"},{"name":"total-rf","type":"uint128"},{"name":"pending-rf","type":"uint128"},{"name":"perf-fee","type":"uint128"},{"name":"mgmt-fee","type":"uint128"},{"name":"reserve-rate","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[reward: TypedAbiArg<number | bigint, "reward">, totalRf: TypedAbiArg<number | bigint, "totalRf">, pendingRf: TypedAbiArg<number | bigint, "pendingRf">, perfFee: TypedAbiArg<number | bigint, "perfFee">, mgmtFee: TypedAbiArg<number | bigint, "mgmtFee">, reserveRate: TypedAbiArg<number | bigint, "reserveRate">], Response<boolean, bigint>>,
    fundTransfers: {"name":"fund-transfers","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    logReward: {"name":"log-reward","access":"public","args":[{"name":"reward","type":"uint128"},{"name":"is-positive","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[reward: TypedAbiArg<number | bigint, "reward">, isPositive: TypedAbiArg<boolean, "isPositive">], Response<boolean, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_INSUFFICIENT_FUNDS: {
  name: 'ERR_INSUFFICIENT_FUNDS',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_PENDING_TRANSFERS: {
  name: 'ERR_NO_PENDING_TRANSFERS',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_ZERO_ONLY_POSITIVE: {
  name: 'ERR_ZERO_ONLY_POSITIVE',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    bpsBase: {
  name: 'bps-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    feeCollector: {
  name: 'fee-collector',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    pctBase: {
  name: 'pct-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    reserve: {
  name: 'reserve',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    rf: {
  name: 'rf',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    sbtcToken: {
  name: 'sbtc-token',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>
  },
  constants: {
  ERR_INSUFFICIENT_FUNDS: {
    isOk: false,
    value: 104_002n
  },
  ERR_NO_PENDING_TRANSFERS: {
    isOk: false,
    value: 104_003n
  },
  ERR_ZERO_ONLY_POSITIVE: {
    isOk: false,
    value: 104_001n
  },
  bpsBase: 10_000n,
  feeCollector: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.fee-collector',
  pctBase: 100n,
  reserve: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.reserve',
  rf: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.reserve-fund',
  sbtcToken: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token'
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'controller-hbtc',
  },
emergencyRecover: {
  "functions": {
    recoverSusdh: {"name":"recover-susdh","access":"public","args":[{"name":"address","type":"principal"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    recoverUsdh: {"name":"recover-usdh","access":"public","args":[{"name":"address","type":"principal"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_NOT_BLACKLISTED: {
  name: 'ERR_NOT_BLACKLISTED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>
  },
  constants: {
  ERR_NOT_BLACKLISTED: {
    isOk: false,
    value: 7_001n
  }
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch25","clarity_version":"Clarity2",
  contractName: 'emergency-recover',
  },
feeCollector: {
  "functions": {
    withdraw: {"name":"withdraw","access":"public","args":[{"name":"asset","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[asset: TypedAbiArg<string, "asset">], Response<boolean, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_INSUFFICIENT_BALANCE: {
  name: 'ERR_INSUFFICIENT_BALANCE',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>
  },
  constants: {
  ERR_INSUFFICIENT_BALANCE: {
    isOk: false,
    value: 107_001n
  }
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'fee-collector',
  },
graniteBorrowerTraitV1: {
  "functions": {
    
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'granite-borrower-trait-v1',
  },
graniteInterface: {
  "functions": {
    writeFeed: {"name":"write-feed","access":"private","args":[{"name":"price-feed","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[priceFeed: TypedAbiArg<Uint8Array | null, "priceFeed">], Response<boolean, bigint>>,
    graniteAddCollateral: {"name":"granite-add-collateral","access":"public","args":[{"name":"borrower","type":"trait_reference"},{"name":"collateral","type":"trait_reference"},{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[borrower: TypedAbiArg<string, "borrower">, collateral: TypedAbiArg<string, "collateral">, amount: TypedAbiArg<number | bigint, "amount">], Response<boolean, bigint>>,
    graniteBorrow: {"name":"granite-borrow","access":"public","args":[{"name":"borrower","type":"trait_reference"},{"name":"asset","type":"trait_reference"},{"name":"amount","type":"uint128"},{"name":"price-feed-1","type":{"optional":{"buffer":{"length":8192}}}},{"name":"price-feed-2","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[borrower: TypedAbiArg<string, "borrower">, asset: TypedAbiArg<string, "asset">, amount: TypedAbiArg<number | bigint, "amount">, priceFeed1: TypedAbiArg<Uint8Array | null, "priceFeed1">, priceFeed2: TypedAbiArg<Uint8Array | null, "priceFeed2">], Response<boolean, bigint>>,
    graniteRemoveCollateral: {"name":"granite-remove-collateral","access":"public","args":[{"name":"borrower","type":"trait_reference"},{"name":"collateral","type":"trait_reference"},{"name":"amount","type":"uint128"},{"name":"price-feed-1","type":{"optional":{"buffer":{"length":8192}}}},{"name":"price-feed-2","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[borrower: TypedAbiArg<string, "borrower">, collateral: TypedAbiArg<string, "collateral">, amount: TypedAbiArg<number | bigint, "amount">, priceFeed1: TypedAbiArg<Uint8Array | null, "priceFeed1">, priceFeed2: TypedAbiArg<Uint8Array | null, "priceFeed2">], Response<boolean, bigint>>,
    graniteRepay: {"name":"granite-repay","access":"public","args":[{"name":"borrower","type":"trait_reference"},{"name":"asset","type":"trait_reference"},{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[borrower: TypedAbiArg<string, "borrower">, asset: TypedAbiArg<string, "asset">, amount: TypedAbiArg<number | bigint, "amount">], Response<boolean, bigint>>,
    sweep: {"name":"sweep","access":"public","args":[{"name":"asset","type":"trait_reference"},{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[asset: TypedAbiArg<string, "asset">, amount: TypedAbiArg<number | bigint, "amount">], Response<bigint, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_INVALID_AMOUNT: {
  name: 'ERR_INVALID_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_ASSET: {
  name: 'ERR_INVALID_ASSET',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    aeusdcToken: {
  name: 'aeusdc-token',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    reserve: {
  name: 'reserve',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>
  },
  constants: {
  ERR_INVALID_AMOUNT: {
    isOk: false,
    value: 112_002n
  },
  ERR_INVALID_ASSET: {
    isOk: false,
    value: 112_001n
  },
  aeusdcToken: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
  reserve: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.reserve'
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'granite-interface',
  },
hbtcToken: {
  "functions": {
    burnForProtocol: {"name":"burn-for-protocol","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">], Response<boolean, bigint>>,
    mintForProtocol: {"name":"mint-for-protocol","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    setBlacklistEnabled: {"name":"set-blacklist-enabled","access":"public","args":[{"name":"enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
    setTokenName: {"name":"set-token-name","access":"public","args":[{"name":"value","type":{"string-ascii":{"length":32}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[value: TypedAbiArg<string, "value">], Response<boolean, bigint>>,
    setTokenUri: {"name":"set-token-uri","access":"public","args":[{"name":"value","type":{"string-utf8":{"length":256}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[value: TypedAbiArg<string, "value">], Response<boolean, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">, memo: TypedAbiArg<Uint8Array | null, "memo">], Response<boolean, bigint>>,
    getBalance: {"name":"get-balance","access":"read_only","args":[{"name":"account","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[account: TypedAbiArg<string, "account">], Response<bigint, null>>,
    getBlacklistEnabled: {"name":"get-blacklist-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getDecimals: {"name":"get-decimals","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getName: {"name":"get-name","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":32}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getSymbol: {"name":"get-symbol","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":4}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"optional":{"string-utf8":{"length":256}}},"error":"none"}}}} as TypedAbiFunction<[], Response<string | null, null>>,
    getTotalSupply: {"name":"get-total-supply","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_NOT_AUTHORIZED: {
  name: 'ERR_NOT_AUTHORIZED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    tokenDecimals: {
  name: 'token-decimals',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    tokenSymbol: {
  name: 'token-symbol',
  type: {
    'string-ascii': {
      length: 4
    }
  },
  access: 'constant'
} as TypedAbiVariable<string>,
    blacklistEnabled: {
  name: 'blacklist-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    tokenName: {
  name: 'token-name',
  type: {
    'string-ascii': {
      length: 32
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    tokenUri: {
  name: 'token-uri',
  type: {
    'string-utf8': {
      length: 256
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>
  },
  constants: {
  ERR_NOT_AUTHORIZED: {
    isOk: false,
    value: 4n
  },
  blacklistEnabled: false,
  tokenDecimals: 8n,
  tokenName: 'hBTC',
  tokenSymbol: 'hBTC',
  tokenUri: ''
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[{"name":"hBTC"}],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'hbtc-token',
  },
hermeticaInterface: {
  "functions": {
    hermeticaMint: {"name":"hermetica-mint","access":"public","args":[{"name":"minting-auto","type":"trait_reference"},{"name":"minting-asset","type":"trait_reference"},{"name":"amount-asset","type":"uint128"},{"name":"amount-usdh","type":"uint128"},{"name":"slippage-tolerance-input","type":"uint128"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}},{"name":"price-feed","type":{"optional":{"buffer":{"length":8192}}}},{"name":"max-pyth-fee","type":"uint128"},{"name":"execution-plan","type":{"tuple":[{"name":"pyth-decoder-contract","type":"trait_reference"},{"name":"pyth-storage-contract","type":"trait_reference"},{"name":"wormhole-core-contract","type":"trait_reference"}]}}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[mintingAuto: TypedAbiArg<string, "mintingAuto">, mintingAsset: TypedAbiArg<string, "mintingAsset">, amountAsset: TypedAbiArg<number | bigint, "amountAsset">, amountUsdh: TypedAbiArg<number | bigint, "amountUsdh">, slippageToleranceInput: TypedAbiArg<number | bigint, "slippageToleranceInput">, memo: TypedAbiArg<Uint8Array | null, "memo">, priceFeed: TypedAbiArg<Uint8Array | null, "priceFeed">, maxPythFee: TypedAbiArg<number | bigint, "maxPythFee">, executionPlan: TypedAbiArg<{
  "pythDecoderContract": string;
  "pythStorageContract": string;
  "wormholeCoreContract": string;
}, "executionPlan">], Response<bigint, bigint>>,
    hermeticaRedeem: {"name":"hermetica-redeem","access":"public","args":[{"name":"minting-auto","type":"trait_reference"},{"name":"redeeming-asset","type":"trait_reference"},{"name":"amount-usdh","type":"uint128"},{"name":"slippage-tolerance-input","type":"uint128"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}},{"name":"price-feed","type":{"optional":{"buffer":{"length":8192}}}},{"name":"max-pyth-fee","type":"uint128"},{"name":"execution-plan","type":{"tuple":[{"name":"pyth-decoder-contract","type":"trait_reference"},{"name":"pyth-storage-contract","type":"trait_reference"},{"name":"wormhole-core-contract","type":"trait_reference"}]}}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[mintingAuto: TypedAbiArg<string, "mintingAuto">, redeemingAsset: TypedAbiArg<string, "redeemingAsset">, amountUsdh: TypedAbiArg<number | bigint, "amountUsdh">, slippageToleranceInput: TypedAbiArg<number | bigint, "slippageToleranceInput">, memo: TypedAbiArg<Uint8Array | null, "memo">, priceFeed: TypedAbiArg<Uint8Array | null, "priceFeed">, maxPythFee: TypedAbiArg<number | bigint, "maxPythFee">, executionPlan: TypedAbiArg<{
  "pythDecoderContract": string;
  "pythStorageContract": string;
  "wormholeCoreContract": string;
}, "executionPlan">], Response<bigint, bigint>>,
    hermeticaStake: {"name":"hermetica-stake","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"staking","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, staking: TypedAbiArg<string, "staking">], Response<bigint, bigint>>,
    hermeticaUnstake: {"name":"hermetica-unstake","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"staking","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, staking: TypedAbiArg<string, "staking">], Response<bigint, bigint>>,
    hermeticaUnstakeAndWithdraw: {"name":"hermetica-unstake-and-withdraw","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"staking","type":"trait_reference"},{"name":"staking-silo","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, staking: TypedAbiArg<string, "staking">, stakingSilo: TypedAbiArg<string, "stakingSilo">], Response<bigint, bigint>>,
    hermeticaWithdraw: {"name":"hermetica-withdraw","access":"public","args":[{"name":"claim-id","type":"uint128"},{"name":"staking-silo","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[claimId: TypedAbiArg<number | bigint, "claimId">, stakingSilo: TypedAbiArg<string, "stakingSilo">], Response<bigint, bigint>>,
    sweep: {"name":"sweep","access":"public","args":[{"name":"asset","type":"trait_reference"},{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[asset: TypedAbiArg<string, "asset">, amount: TypedAbiArg<number | bigint, "amount">], Response<bigint, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_INVALID_AMOUNT: {
  name: 'ERR_INVALID_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    reserve: {
  name: 'reserve',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    susdhToken: {
  name: 'susdh-token',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    usdhBase: {
  name: 'usdh-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    usdhToken: {
  name: 'usdh-token',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>
  },
  constants: {
  ERR_INVALID_AMOUNT: {
    isOk: false,
    value: 110_001n
  },
  reserve: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.reserve',
  susdhToken: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.susdh-token',
  usdhBase: 100_000_000n,
  usdhToken: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.usdh-token'
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'hermetica-interface',
  },
hq: {
  "functions": {
    activateAdmin: {"name":"activate-admin","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    activateMintingContract: {"name":"activate-minting-contract","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    activateNextOwner: {"name":"activate-next-owner","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    disableContracts: {"name":"disable-contracts","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    disableMinting: {"name":"disable-minting","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    removeAdmin: {"name":"remove-admin","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    removeMintingContract: {"name":"remove-minting-contract","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    requestAdminUpdate: {"name":"request-admin-update","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    requestMintingContractUpdate: {"name":"request-minting-contract-update","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    requestOwnerUpdate: {"name":"request-owner-update","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    setContractActive: {"name":"set-contract-active","access":"public","args":[{"name":"address","type":"principal"},{"name":"active","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, active: TypedAbiArg<boolean, "active">], Response<boolean, bigint>>,
    setContractsEnabled: {"name":"set-contracts-enabled","access":"public","args":[{"name":"enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
    setGuardian: {"name":"set-guardian","access":"public","args":[{"name":"address","type":"principal"},{"name":"active","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, active: TypedAbiArg<boolean, "active">], Response<boolean, bigint>>,
    setMintingEnabled: {"name":"set-minting-enabled","access":"public","args":[{"name":"enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
    checkIsAdmin: {"name":"check-is-admin","access":"read_only","args":[{"name":"contract","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[contract: TypedAbiArg<string, "contract">], Response<boolean, bigint>>,
    checkIsEnabled: {"name":"check-is-enabled","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    checkIsGuardian: {"name":"check-is-guardian","access":"read_only","args":[{"name":"contract","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[contract: TypedAbiArg<string, "contract">], Response<boolean, bigint>>,
    checkIsMintingContract: {"name":"check-is-minting-contract","access":"read_only","args":[{"name":"contract","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[contract: TypedAbiArg<string, "contract">], Response<boolean, bigint>>,
    checkIsOwner: {"name":"check-is-owner","access":"read_only","args":[{"name":"contract","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[contract: TypedAbiArg<string, "contract">], Response<boolean, bigint>>,
    checkIsProtocol: {"name":"check-is-protocol","access":"read_only","args":[{"name":"contract","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[contract: TypedAbiArg<string, "contract">], Response<boolean, bigint>>,
    getAdmin: {"name":"get-admin","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"tuple":[{"name":"active","type":"bool"},{"name":"burn-block-height","type":{"optional":"uint128"}}]}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], {
  "active": boolean;
  "burnBlockHeight": bigint | null;
}>,
    getContractActive: {"name":"get-contract-active","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getContractsEnabled: {"name":"get-contracts-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getGuardian: {"name":"get-guardian","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getMintingContract: {"name":"get-minting-contract","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"tuple":[{"name":"active","type":"bool"},{"name":"burn-block-height","type":{"optional":"uint128"}}]}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], {
  "active": boolean;
  "burnBlockHeight": bigint | null;
}>,
    getMintingEnabled: {"name":"get-minting-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getNextOwner: {"name":"get-next-owner","access":"read_only","args":[],"outputs":{"type":{"tuple":[{"name":"address","type":"principal"},{"name":"burn-block-height","type":"uint128"}]}}} as TypedAbiFunction<[], {
  "address": string;
  "burnBlockHeight": bigint;
}>,
    getOwner: {"name":"get-owner","access":"read_only","args":[],"outputs":{"type":"principal"}} as TypedAbiFunction<[], string>
  },
  "maps": {
    admins: {"name":"admins","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"active","type":"bool"},{"name":"burn-block-height","type":{"optional":"uint128"}}]}} as TypedAbiMap<{
  "address": string;
}, {
  "active": boolean;
  "burnBlockHeight": bigint | null;
}>,
    contracts: {"name":"contracts","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"active","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "active": boolean;
}>,
    guardians: {"name":"guardians","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"active","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "active": boolean;
}>,
    mintingContracts: {"name":"minting-contracts","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"active","type":"bool"},{"name":"burn-block-height","type":{"optional":"uint128"}}]}} as TypedAbiMap<{
  "address": string;
}, {
  "active": boolean;
  "burnBlockHeight": bigint | null;
}>
  },
  "variables": {
    ERR_ACTIVATION: {
  name: 'ERR_ACTIVATION',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_CONTRACTS_DISABLED: {
  name: 'ERR_CONTRACTS_DISABLED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INACTIVE_CONTRACT: {
  name: 'ERR_INACTIVE_CONTRACT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MINTING_DISABLED: {
  name: 'ERR_MINTING_DISABLED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_ADMIN: {
  name: 'ERR_NOT_ADMIN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_GUARDIAN: {
  name: 'ERR_NOT_GUARDIAN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_OWNER: {
  name: 'ERR_NOT_OWNER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_ENTRY: {
  name: 'ERR_NO_ENTRY',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    activationDelay: {
  name: 'activation-delay',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    contractsEnabled: {
  name: 'contracts-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    mintingEnabled: {
  name: 'minting-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    nextOwner: {
  name: 'next-owner',
  type: {
    tuple: [
      {
        name: 'address',
        type: 'principal'
      },
      {
        name: 'burn-block-height',
        type: 'uint128'
      }
    ]
  },
  access: 'variable'
} as TypedAbiVariable<{
  "address": string;
  "burnBlockHeight": bigint;
}>,
    owner: {
  name: 'owner',
  type: 'principal',
  access: 'variable'
} as TypedAbiVariable<string>
  },
  constants: {
  ERR_ACTIVATION: {
    isOk: false,
    value: 1_008n
  },
  ERR_CONTRACTS_DISABLED: {
    isOk: false,
    value: 1_004n
  },
  ERR_INACTIVE_CONTRACT: {
    isOk: false,
    value: 1_006n
  },
  ERR_MINTING_DISABLED: {
    isOk: false,
    value: 1_005n
  },
  ERR_NOT_ADMIN: {
    isOk: false,
    value: 1_002n
  },
  ERR_NOT_GUARDIAN: {
    isOk: false,
    value: 1_003n
  },
  ERR_NOT_OWNER: {
    isOk: false,
    value: 1_001n
  },
  ERR_NO_ENTRY: {
    isOk: false,
    value: 1_007n
  },
  activationDelay: 1_008n,
  contractsEnabled: true,
  mintingEnabled: true,
  nextOwner: {
    address: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R',
    burnBlockHeight: 933_210n
  },
  owner: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R'
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch25","clarity_version":"Clarity2",
  contractName: 'hq',
  },
hqHbtc: {
  "functions": {
    cancelUpdate: {"name":"cancel-update","access":"private","args":[{"name":"type","type":{"buffer":{"length":1}}},{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">, address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    confirmUpdate: {"name":"confirm-update","access":"private","args":[{"name":"type","type":{"buffer":{"length":1}}},{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">, address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    requestUpdate: {"name":"request-update","access":"private","args":[{"name":"type","type":{"buffer":{"length":1}}},{"name":"address","type":"principal"},{"name":"is-add","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">, address: TypedAbiArg<string, "address">, isAdd: TypedAbiArg<boolean, "isAdd">], Response<boolean, bigint>>,
    cancelAdminRequest: {"name":"cancel-admin-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    cancelFeeSetterRequest: {"name":"cancel-fee-setter-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    cancelGuardianRequest: {"name":"cancel-guardian-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    cancelManagerRequest: {"name":"cancel-manager-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    cancelNewOwner: {"name":"cancel-new-owner","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    cancelNewTimelock: {"name":"cancel-new-timelock","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    cancelProtocolRequest: {"name":"cancel-protocol-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    cancelRewarderRequest: {"name":"cancel-rewarder-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    cancelTraderRequest: {"name":"cancel-trader-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    claimOwner: {"name":"claim-owner","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    confirmAdminRequest: {"name":"confirm-admin-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    confirmFeeSetterRequest: {"name":"confirm-fee-setter-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    confirmGuardianRequest: {"name":"confirm-guardian-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    confirmManagerRequest: {"name":"confirm-manager-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    confirmNewTimelock: {"name":"confirm-new-timelock","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    confirmProtocolRequest: {"name":"confirm-protocol-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    confirmRewarderRequest: {"name":"confirm-rewarder-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    confirmTraderRequest: {"name":"confirm-trader-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    disableProtocol: {"name":"disable-protocol","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    requestAdminUpdate: {"name":"request-admin-update","access":"public","args":[{"name":"address","type":"principal"},{"name":"is-add","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, isAdd: TypedAbiArg<boolean, "isAdd">], Response<boolean, bigint>>,
    requestFeeSetterUpdate: {"name":"request-fee-setter-update","access":"public","args":[{"name":"address","type":"principal"},{"name":"is-add","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, isAdd: TypedAbiArg<boolean, "isAdd">], Response<boolean, bigint>>,
    requestGuardianUpdate: {"name":"request-guardian-update","access":"public","args":[{"name":"address","type":"principal"},{"name":"is-add","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, isAdd: TypedAbiArg<boolean, "isAdd">], Response<boolean, bigint>>,
    requestManagerUpdate: {"name":"request-manager-update","access":"public","args":[{"name":"address","type":"principal"},{"name":"is-add","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, isAdd: TypedAbiArg<boolean, "isAdd">], Response<boolean, bigint>>,
    requestNewOwner: {"name":"request-new-owner","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    requestNewTimelock: {"name":"request-new-timelock","access":"public","args":[{"name":"duration","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[duration: TypedAbiArg<number | bigint, "duration">], Response<boolean, bigint>>,
    requestProtocolUpdate: {"name":"request-protocol-update","access":"public","args":[{"name":"address","type":"principal"},{"name":"is-add","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, isAdd: TypedAbiArg<boolean, "isAdd">], Response<boolean, bigint>>,
    requestRewarderUpdate: {"name":"request-rewarder-update","access":"public","args":[{"name":"address","type":"principal"},{"name":"is-add","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, isAdd: TypedAbiArg<boolean, "isAdd">], Response<boolean, bigint>>,
    requestTraderUpdate: {"name":"request-trader-update","access":"public","args":[{"name":"address","type":"principal"},{"name":"is-add","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, isAdd: TypedAbiArg<boolean, "isAdd">], Response<boolean, bigint>>,
    setProtocolEnabled: {"name":"set-protocol-enabled","access":"public","args":[{"name":"enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
    checkIsAdmin: {"name":"check-is-admin","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    checkIsFeeSetter: {"name":"check-is-fee-setter","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    checkIsGuardian: {"name":"check-is-guardian","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    checkIsManager: {"name":"check-is-manager","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    checkIsOwner: {"name":"check-is-owner","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    checkIsProtocol: {"name":"check-is-protocol","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    checkIsProtocolEnabled: {"name":"check-is-protocol-enabled","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    checkIsProtocolTwo: {"name":"check-is-protocol-two","access":"read_only","args":[{"name":"address-1","type":"principal"},{"name":"address-2","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address1: TypedAbiArg<string, "address1">, address2: TypedAbiArg<string, "address2">], Response<boolean, bigint>>,
    checkIsRewarder: {"name":"check-is-rewarder","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    checkIsStandard: {"name":"check-is-standard","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    checkIsTrader: {"name":"check-is-trader","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    checkTimelock: {"name":"check-timelock","access":"read_only","args":[{"name":"ts","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[ts: TypedAbiArg<number | bigint, "ts">], Response<boolean, bigint>>,
    getAdmin: {"name":"get-admin","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getFeeSetter: {"name":"get-fee-setter","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getGuardian: {"name":"get-guardian","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getManager: {"name":"get-manager","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getNextOwner: {"name":"get-next-owner","access":"read_only","args":[],"outputs":{"type":{"tuple":[{"name":"address","type":"principal"},{"name":"ts","type":"uint128"}]}}} as TypedAbiFunction<[], {
  "address": string;
  "ts": bigint;
}>,
    getNextTimelock: {"name":"get-next-timelock","access":"read_only","args":[],"outputs":{"type":{"tuple":[{"name":"duration","type":"uint128"},{"name":"ts","type":"uint128"}]}}} as TypedAbiFunction<[], {
  "duration": bigint;
  "ts": bigint;
}>,
    getOwner: {"name":"get-owner","access":"read_only","args":[],"outputs":{"type":"principal"}} as TypedAbiFunction<[], string>,
    getProtocol: {"name":"get-protocol","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getProtocolEnabled: {"name":"get-protocol-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getRewarder: {"name":"get-rewarder","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getRole: {"name":"get-role","access":"read_only","args":[{"name":"address","type":"principal"},{"name":"type","type":{"buffer":{"length":1}}}],"outputs":{"type":{"tuple":[{"name":"active","type":"bool"}]}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, type: TypedAbiArg<Uint8Array, "type">], {
  "active": boolean;
}>,
    getTimelock: {"name":"get-timelock","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getTrader: {"name":"get-trader","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getUpdateRequest: {"name":"get-update-request","access":"read_only","args":[{"name":"type","type":{"buffer":{"length":1}}},{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"is-add","type":"bool"},{"name":"ts","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">, address: TypedAbiArg<string, "address">], Response<{
  "isAdd": boolean;
  "ts": bigint;
}, bigint>>
  },
  "maps": {
    roles: {"name":"roles","key":{"tuple":[{"name":"address","type":"principal"},{"name":"type","type":{"buffer":{"length":1}}}]},"value":{"tuple":[{"name":"active","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
  "type": Uint8Array;
}, {
  "active": boolean;
}>,
    updateRequests: {"name":"update-requests","key":{"tuple":[{"name":"address","type":"principal"},{"name":"type","type":{"buffer":{"length":1}}}]},"value":{"tuple":[{"name":"is-add","type":"bool"},{"name":"ts","type":"uint128"}]}} as TypedAbiMap<{
  "address": string;
  "type": Uint8Array;
}, {
  "isAdd": boolean;
  "ts": bigint;
}>
  },
  "variables": {
    ADMIN: {
  name: 'ADMIN',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    ERR_ABOVE_MAX: {
  name: 'ERR_ABOVE_MAX',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_BELOW_MIN: {
  name: 'ERR_BELOW_MIN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_DUPLICATE: {
  name: 'ERR_DUPLICATE',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_ROLE: {
  name: 'ERR_INVALID_ROLE',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_ADMIN: {
  name: 'ERR_NOT_ADMIN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_FEE_SETTER: {
  name: 'ERR_NOT_FEE_SETTER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_GUARDIAN: {
  name: 'ERR_NOT_GUARDIAN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_MANAGER: {
  name: 'ERR_NOT_MANAGER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_NEXT_OWNER: {
  name: 'ERR_NOT_NEXT_OWNER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_OWNER: {
  name: 'ERR_NOT_OWNER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_PROTOCOL: {
  name: 'ERR_NOT_PROTOCOL',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_REWARDER: {
  name: 'ERR_NOT_REWARDER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_STANDARD: {
  name: 'ERR_NOT_STANDARD',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_TRADER: {
  name: 'ERR_NOT_TRADER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_ENTRY: {
  name: 'ERR_NO_ENTRY',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_PENDING_REQUEST: {
  name: 'ERR_PENDING_REQUEST',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_PROTOCOL_DISABLED: {
  name: 'ERR_PROTOCOL_DISABLED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_TIMELOCK: {
  name: 'ERR_TIMELOCK',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    FEE_SETTER: {
  name: 'FEE_SETTER',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    GUARDIAN: {
  name: 'GUARDIAN',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    MANAGER: {
  name: 'MANAGER',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    PROTOCOL: {
  name: 'PROTOCOL',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    REWARDER: {
  name: 'REWARDER',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    TRADER: {
  name: 'TRADER',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    max: {
  name: 'max',
  type: {
    tuple: [
      {
        name: 'timelock',
        type: 'uint128'
      }
    ]
  },
  access: 'constant'
} as TypedAbiVariable<{
  "timelock": bigint;
}>,
    min: {
  name: 'min',
  type: {
    tuple: [
      {
        name: 'timelock',
        type: 'uint128'
      }
    ]
  },
  access: 'constant'
} as TypedAbiVariable<{
  "timelock": bigint;
}>,
    nextOwner: {
  name: 'next-owner',
  type: {
    tuple: [
      {
        name: 'address',
        type: 'principal'
      },
      {
        name: 'ts',
        type: 'uint128'
      }
    ]
  },
  access: 'variable'
} as TypedAbiVariable<{
  "address": string;
  "ts": bigint;
}>,
    nextTimelock: {
  name: 'next-timelock',
  type: {
    tuple: [
      {
        name: 'duration',
        type: 'uint128'
      },
      {
        name: 'ts',
        type: 'uint128'
      }
    ]
  },
  access: 'variable'
} as TypedAbiVariable<{
  "duration": bigint;
  "ts": bigint;
}>,
    owner: {
  name: 'owner',
  type: 'principal',
  access: 'variable'
} as TypedAbiVariable<string>,
    protocolEnabled: {
  name: 'protocol-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    timelock: {
  name: 'timelock',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>
  },
  constants: {
  ADMIN: Uint8Array.from([1]),
  ERR_ABOVE_MAX: {
    isOk: false,
    value: 101_013n
  },
  ERR_BELOW_MIN: {
    isOk: false,
    value: 101_012n
  },
  ERR_DUPLICATE: {
    isOk: false,
    value: 101_016n
  },
  ERR_INVALID_ROLE: {
    isOk: false,
    value: 101_017n
  },
  ERR_NOT_ADMIN: {
    isOk: false,
    value: 101_003n
  },
  ERR_NOT_FEE_SETTER: {
    isOk: false,
    value: 101_008n
  },
  ERR_NOT_GUARDIAN: {
    isOk: false,
    value: 101_004n
  },
  ERR_NOT_MANAGER: {
    isOk: false,
    value: 101_007n
  },
  ERR_NOT_NEXT_OWNER: {
    isOk: false,
    value: 101_002n
  },
  ERR_NOT_OWNER: {
    isOk: false,
    value: 101_001n
  },
  ERR_NOT_PROTOCOL: {
    isOk: false,
    value: 101_009n
  },
  ERR_NOT_REWARDER: {
    isOk: false,
    value: 101_006n
  },
  ERR_NOT_STANDARD: {
    isOk: false,
    value: 101_011n
  },
  ERR_NOT_TRADER: {
    isOk: false,
    value: 101_005n
  },
  ERR_NO_ENTRY: {
    isOk: false,
    value: 101_015n
  },
  ERR_PENDING_REQUEST: {
    isOk: false,
    value: 101_018n
  },
  ERR_PROTOCOL_DISABLED: {
    isOk: false,
    value: 101_010n
  },
  ERR_TIMELOCK: {
    isOk: false,
    value: 101_014n
  },
  FEE_SETTER: Uint8Array.from([6]),
  GUARDIAN: Uint8Array.from([2]),
  MANAGER: Uint8Array.from([5]),
  PROTOCOL: Uint8Array.from([7]),
  REWARDER: Uint8Array.from([4]),
  TRADER: Uint8Array.from([3]),
  max: {
    timelock: 2_592_000n
  },
  min: {
    timelock: 86_400n
  },
  nextOwner: {
    address: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R',
    ts: 1_769_080_130n
  },
  nextTimelock: {
    duration: 86_400n,
    ts: 1_769_080_130n
  },
  owner: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R',
  protocolEnabled: true,
  timelock: 86_400n
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'hq-hbtc',
  },
interimTokenTrait: {
  "functions": {
    
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch25","clarity_version":"Clarity2",
  contractName: 'interim-token-trait',
  },
minting: {
  "functions": {
    checkConfidence: {"name":"check-confidence","access":"private","args":[{"name":"price","type":"uint128"},{"name":"conf","type":"uint128"},{"name":"conf-tolerance-bps","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[price: TypedAbiArg<number | bigint, "price">, conf: TypedAbiArg<number | bigint, "conf">, confToleranceBps: TypedAbiArg<number | bigint, "confToleranceBps">], Response<boolean, bigint>>,
    verifyPrice: {"name":"verify-price","access":"private","args":[{"name":"price","type":"uint128"},{"name":"conf-tolerance-bps","type":"uint128"},{"name":"oracle-data","type":{"tuple":[{"name":"conf","type":"uint128"},{"name":"ema-conf","type":"uint128"},{"name":"ema-price","type":"int128"},{"name":"expo","type":"int128"},{"name":"prev-publish-time","type":"uint128"},{"name":"price","type":"int128"},{"name":"price-identifier","type":{"buffer":{"length":32}}},{"name":"publish-time","type":"uint128"}]}},{"name":"asset-contract","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[price: TypedAbiArg<number | bigint, "price">, confToleranceBps: TypedAbiArg<number | bigint, "confToleranceBps">, oracleData: TypedAbiArg<{
  "conf": number | bigint;
  "emaConf": number | bigint;
  "emaPrice": number | bigint;
  "expo": number | bigint;
  "prevPublishTime": number | bigint;
  "price": number | bigint;
  "priceIdentifier": Uint8Array;
  "publishTime": number | bigint;
}, "oracleData">, assetContract: TypedAbiArg<string, "assetContract">], Response<boolean, bigint>>,
    cancelMintRequest: {"name":"cancel-mint-request","access":"public","args":[{"name":"entry","type":{"tuple":[{"name":"minting-asset","type":"trait_reference"},{"name":"request-id","type":"uint128"}]}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[entry: TypedAbiArg<{
  "mintingAsset": string;
  "requestId": number | bigint;
}, "entry">], Response<boolean, bigint>>,
    cancelMintRequestMany: {"name":"cancel-mint-request-many","access":"public","args":[{"name":"entries","type":{"list":{"type":{"tuple":[{"name":"minting-asset","type":"trait_reference"},{"name":"request-id","type":"uint128"}]},"length":1000}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":1000}},"error":"none"}}}} as TypedAbiFunction<[entries: TypedAbiArg<{
  "mintingAsset": string;
  "requestId": number | bigint;
}[], "entries">], Response<Response<boolean, bigint>[], null>>,
    cancelRedeemRequest: {"name":"cancel-redeem-request","access":"public","args":[{"name":"request-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[requestId: TypedAbiArg<number | bigint, "requestId">], Response<boolean, bigint>>,
    cancelRedeemRequestMany: {"name":"cancel-redeem-request-many","access":"public","args":[{"name":"entries","type":{"list":{"type":"uint128","length":1000}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":1000}},"error":"none"}}}} as TypedAbiFunction<[entries: TypedAbiArg<number | bigint[], "entries">], Response<Response<boolean, bigint>[], null>>,
    claimUnconfirmedMint: {"name":"claim-unconfirmed-mint","access":"public","args":[{"name":"entry","type":{"tuple":[{"name":"minting-asset","type":"trait_reference"},{"name":"request-id","type":"uint128"}]}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[entry: TypedAbiArg<{
  "mintingAsset": string;
  "requestId": number | bigint;
}, "entry">], Response<boolean, bigint>>,
    claimUnconfirmedMintMany: {"name":"claim-unconfirmed-mint-many","access":"public","args":[{"name":"entries","type":{"list":{"type":{"tuple":[{"name":"minting-asset","type":"trait_reference"},{"name":"request-id","type":"uint128"}]},"length":1000}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":1000}},"error":"none"}}}} as TypedAbiFunction<[entries: TypedAbiArg<{
  "mintingAsset": string;
  "requestId": number | bigint;
}[], "entries">], Response<Response<boolean, bigint>[], null>>,
    claimUnconfirmedRedeem: {"name":"claim-unconfirmed-redeem","access":"public","args":[{"name":"redeem-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[redeemId: TypedAbiArg<number | bigint, "redeemId">], Response<boolean, bigint>>,
    claimUnconfirmedRedeemMany: {"name":"claim-unconfirmed-redeem-many","access":"public","args":[{"name":"entries","type":{"list":{"type":"uint128","length":1000}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":1000}},"error":"none"}}}} as TypedAbiFunction<[entries: TypedAbiArg<number | bigint[], "entries">], Response<Response<boolean, bigint>[], null>>,
    confirmMint: {"name":"confirm-mint","access":"public","args":[{"name":"request-id","type":"uint128"},{"name":"price","type":"uint128"},{"name":"amount-asset-confirmed","type":"uint128"},{"name":"minting-asset","type":"trait_reference"},{"name":"custody-address","type":"principal"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[requestId: TypedAbiArg<number | bigint, "requestId">, price: TypedAbiArg<number | bigint, "price">, amountAssetConfirmed: TypedAbiArg<number | bigint, "amountAssetConfirmed">, mintingAsset: TypedAbiArg<string, "mintingAsset">, custodyAddress: TypedAbiArg<string, "custodyAddress">, memo: TypedAbiArg<Uint8Array | null, "memo">], Response<boolean, bigint>>,
    confirmRedeem: {"name":"confirm-redeem","access":"public","args":[{"name":"request-id","type":"uint128"},{"name":"price","type":"uint128"},{"name":"amount-usdh-confirmed","type":"uint128"},{"name":"redeeming-asset","type":"trait_reference"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[requestId: TypedAbiArg<number | bigint, "requestId">, price: TypedAbiArg<number | bigint, "price">, amountUsdhConfirmed: TypedAbiArg<number | bigint, "amountUsdhConfirmed">, redeemingAsset: TypedAbiArg<string, "redeemingAsset">, memo: TypedAbiArg<Uint8Array | null, "memo">], Response<boolean, bigint>>,
    requestMint: {"name":"request-mint","access":"public","args":[{"name":"minting-asset","type":"trait_reference"},{"name":"amount-asset","type":"uint128"},{"name":"price","type":"uint128"},{"name":"slippage","type":"uint128"},{"name":"price-feed-bytes","type":{"buffer":{"length":8192}}},{"name":"execution-plan","type":{"tuple":[{"name":"pyth-decoder-contract","type":"trait_reference"},{"name":"pyth-storage-contract","type":"trait_reference"},{"name":"wormhole-core-contract","type":"trait_reference"}]}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[mintingAsset: TypedAbiArg<string, "mintingAsset">, amountAsset: TypedAbiArg<number | bigint, "amountAsset">, price: TypedAbiArg<number | bigint, "price">, slippage: TypedAbiArg<number | bigint, "slippage">, priceFeedBytes: TypedAbiArg<Uint8Array, "priceFeedBytes">, executionPlan: TypedAbiArg<{
  "pythDecoderContract": string;
  "pythStorageContract": string;
  "wormholeCoreContract": string;
}, "executionPlan">], Response<boolean, bigint>>,
    requestRedeem: {"name":"request-redeem","access":"public","args":[{"name":"redeeming-asset","type":"trait_reference"},{"name":"amount-usdh","type":"uint128"},{"name":"price","type":"uint128"},{"name":"slippage","type":"uint128"},{"name":"price-feed-bytes","type":{"buffer":{"length":8192}}},{"name":"execution-plan","type":{"tuple":[{"name":"pyth-decoder-contract","type":"trait_reference"},{"name":"pyth-storage-contract","type":"trait_reference"},{"name":"wormhole-core-contract","type":"trait_reference"}]}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[redeemingAsset: TypedAbiArg<string, "redeemingAsset">, amountUsdh: TypedAbiArg<number | bigint, "amountUsdh">, price: TypedAbiArg<number | bigint, "price">, slippage: TypedAbiArg<number | bigint, "slippage">, priceFeedBytes: TypedAbiArg<Uint8Array, "priceFeedBytes">, executionPlan: TypedAbiArg<{
  "pythDecoderContract": string;
  "pythStorageContract": string;
  "wormholeCoreContract": string;
}, "executionPlan">], Response<boolean, bigint>>,
    setBlockDelay: {"name":"set-block-delay","access":"public","args":[{"name":"new-amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newAmount: TypedAbiArg<number | bigint, "newAmount">], Response<boolean, bigint>>,
    setCustodyAddress: {"name":"set-custody-address","access":"public","args":[{"name":"custody-address","type":"principal"},{"name":"active","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[custodyAddress: TypedAbiArg<string, "custodyAddress">, active: TypedAbiArg<boolean, "active">], Response<boolean, bigint>>,
    setMintLimit: {"name":"set-mint-limit","access":"public","args":[{"name":"new-mint-limit","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newMintLimit: TypedAbiArg<number | bigint, "newMintLimit">], Response<boolean, bigint>>,
    setMintLimitResetWindow: {"name":"set-mint-limit-reset-window","access":"public","args":[{"name":"new-window","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newWindow: TypedAbiArg<number | bigint, "newWindow">], Response<boolean, bigint>>,
    setSupportedAsset: {"name":"set-supported-asset","access":"public","args":[{"name":"token","type":"trait_reference"},{"name":"active","type":"bool"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"conf-tolerance-bps","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[token: TypedAbiArg<string, "token">, active: TypedAbiArg<boolean, "active">, priceFeedId: TypedAbiArg<Uint8Array, "priceFeedId">, confToleranceBps: TypedAbiArg<number | bigint, "confToleranceBps">], Response<boolean, bigint>>,
    setTrader: {"name":"set-trader","access":"public","args":[{"name":"address","type":"principal"},{"name":"mint","type":"bool"},{"name":"redeem","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, mint: TypedAbiArg<boolean, "mint">, redeem: TypedAbiArg<boolean, "redeem">], Response<boolean, bigint>>,
    checkIsSupportedAsset: {"name":"check-is-supported-asset","access":"read_only","args":[{"name":"contract","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[contract: TypedAbiArg<string, "contract">], boolean>,
    getBlockDelay: {"name":"get-block-delay","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getCurrentMintId: {"name":"get-current-mint-id","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getCurrentMintLimit: {"name":"get-current-mint-limit","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getCurrentRedeemId: {"name":"get-current-redeem-id","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getCustodyAddressActive: {"name":"get-custody-address-active","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getLastMintLimitReset: {"name":"get-last-mint-limit-reset","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMintLimit: {"name":"get-mint-limit","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMintLimitResetWindow: {"name":"get-mint-limit-reset-window","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMintRequest: {"name":"get-mint-request","access":"read_only","args":[{"name":"request-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"amount-asset","type":"uint128"},{"name":"block-height","type":"uint128"},{"name":"minting-asset","type":"principal"},{"name":"price","type":"uint128"},{"name":"requester","type":"principal"},{"name":"slippage","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[requestId: TypedAbiArg<number | bigint, "requestId">], Response<{
  "amountAsset": bigint;
  "blockHeight": bigint;
  "mintingAsset": string;
  "price": bigint;
  "requester": string;
  "slippage": bigint;
}, bigint>>,
    getRedeemRequest: {"name":"get-redeem-request","access":"read_only","args":[{"name":"request-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"amount-usdh","type":"uint128"},{"name":"block-height","type":"uint128"},{"name":"price","type":"uint128"},{"name":"redeeming-asset","type":"principal"},{"name":"requester","type":"principal"},{"name":"slippage","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[requestId: TypedAbiArg<number | bigint, "requestId">], Response<{
  "amountUsdh": bigint;
  "blockHeight": bigint;
  "price": bigint;
  "redeemingAsset": string;
  "requester": string;
  "slippage": bigint;
}, bigint>>,
    getSupportedAsset: {"name":"get-supported-asset","access":"read_only","args":[{"name":"contract","type":"principal"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"active","type":"bool"},{"name":"conf-tolerance-bps","type":"uint128"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"token-base","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[contract: TypedAbiArg<string, "contract">], Response<{
  "active": boolean;
  "confToleranceBps": bigint;
  "priceFeedId": Uint8Array;
  "tokenBase": bigint;
}, bigint>>,
    getTrader: {"name":"get-trader","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"tuple":[{"name":"minter","type":"bool"},{"name":"redeemer","type":"bool"}]}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], {
  "minter": boolean;
  "redeemer": boolean;
}>
  },
  "maps": {
    custodyAddresses: {"name":"custody-addresses","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"active","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "active": boolean;
}>,
    mintRequests: {"name":"mint-requests","key":{"tuple":[{"name":"request-id","type":"uint128"}]},"value":{"tuple":[{"name":"amount-asset","type":"uint128"},{"name":"block-height","type":"uint128"},{"name":"minting-asset","type":"principal"},{"name":"price","type":"uint128"},{"name":"requester","type":"principal"},{"name":"slippage","type":"uint128"}]}} as TypedAbiMap<{
  "requestId": number | bigint;
}, {
  "amountAsset": bigint;
  "blockHeight": bigint;
  "mintingAsset": string;
  "price": bigint;
  "requester": string;
  "slippage": bigint;
}>,
    redeemRequests: {"name":"redeem-requests","key":{"tuple":[{"name":"request-id","type":"uint128"}]},"value":{"tuple":[{"name":"amount-usdh","type":"uint128"},{"name":"block-height","type":"uint128"},{"name":"price","type":"uint128"},{"name":"redeeming-asset","type":"principal"},{"name":"requester","type":"principal"},{"name":"slippage","type":"uint128"}]}} as TypedAbiMap<{
  "requestId": number | bigint;
}, {
  "amountUsdh": bigint;
  "blockHeight": bigint;
  "price": bigint;
  "redeemingAsset": string;
  "requester": string;
  "slippage": bigint;
}>,
    supportedAssets: {"name":"supported-assets","key":{"tuple":[{"name":"contract","type":"principal"}]},"value":{"tuple":[{"name":"active","type":"bool"},{"name":"conf-tolerance-bps","type":"uint128"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"token-base","type":"uint128"}]}} as TypedAbiMap<{
  "contract": string;
}, {
  "active": boolean;
  "confToleranceBps": bigint;
  "priceFeedId": Uint8Array;
  "tokenBase": bigint;
}>,
    traders: {"name":"traders","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"minter","type":"bool"},{"name":"redeemer","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "minter": boolean;
  "redeemer": boolean;
}>
  },
  "variables": {
    ERR_ABOVE_MAX: {
  name: 'ERR_ABOVE_MAX',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_AMOUNT_NOT_ALLOWED: {
  name: 'ERR_AMOUNT_NOT_ALLOWED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_ASSET_MISMATCH: {
  name: 'ERR_ASSET_MISMATCH',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_BELOW_MIN: {
  name: 'ERR_BELOW_MIN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_CONFIRMATION_OPEN: {
  name: 'ERR_CONFIRMATION_OPEN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MAX_CONF_TOO_HIGH: {
  name: 'ERR_MAX_CONF_TOO_HIGH',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MINT_LIMIT_EXCEEDED: {
  name: 'ERR_MINT_LIMIT_EXCEEDED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_ALLOWED: {
  name: 'ERR_NOT_ALLOWED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_CUSTODY_ADDRESS: {
  name: 'ERR_NOT_CUSTODY_ADDRESS',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_STANDARD_PRINCIPAL: {
  name: 'ERR_NOT_STANDARD_PRINCIPAL',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_SUPPORTED_ASSET: {
  name: 'ERR_NOT_SUPPORTED_ASSET',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_WHITELISTED: {
  name: 'ERR_NOT_WHITELISTED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_REQUEST_FOR_ID: {
  name: 'ERR_NO_REQUEST_FOR_ID',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_ORACLE_CONF_TOO_LOW: {
  name: 'ERR_ORACLE_CONF_TOO_LOW',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_PRICE_FEED_MISMATCH: {
  name: 'ERR_PRICE_FEED_MISMATCH',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_PRICE_OUT_OF_RANGE: {
  name: 'ERR_PRICE_OUT_OF_RANGE',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_SLIPPAGE_TOO_HIGH: {
  name: 'ERR_SLIPPAGE_TOO_HIGH',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_STALE_DATA: {
  name: 'ERR_STALE_DATA',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_TRADING_DISABLED: {
  name: 'ERR_TRADING_DISABLED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    bpsBase: {
  name: 'bps-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    maxBlockDelay: {
  name: 'max-block-delay',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    maxMintLimit: {
  name: 'max-mint-limit',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    maxPriceDeviation: {
  name: 'max-price-deviation',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    minMintLimitResetWindow: {
  name: 'min-mint-limit-reset-window',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    priceBase: {
  name: 'price-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    thisContract: {
  name: 'this-contract',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    usdhBase: {
  name: 'usdh-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    blockDelay: {
  name: 'block-delay',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    currentMintId: {
  name: 'current-mint-id',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    currentMintLimit: {
  name: 'current-mint-limit',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    currentRedeemId: {
  name: 'current-redeem-id',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    lastMintLimitReset: {
  name: 'last-mint-limit-reset',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    mintLimit: {
  name: 'mint-limit',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    mintLimitResetWindow: {
  name: 'mint-limit-reset-window',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>
  },
  constants: {
  ERR_ABOVE_MAX: {
    isOk: false,
    value: 2_214n
  },
  ERR_AMOUNT_NOT_ALLOWED: {
    isOk: false,
    value: 2_205n
  },
  ERR_ASSET_MISMATCH: {
    isOk: false,
    value: 2_209n
  },
  ERR_BELOW_MIN: {
    isOk: false,
    value: 2_215n
  },
  ERR_CONFIRMATION_OPEN: {
    isOk: false,
    value: 2_204n
  },
  ERR_MAX_CONF_TOO_HIGH: {
    isOk: false,
    value: 2_217n
  },
  ERR_MINT_LIMIT_EXCEEDED: {
    isOk: false,
    value: 2_213n
  },
  ERR_NOT_ALLOWED: {
    isOk: false,
    value: 2_202n
  },
  ERR_NOT_CUSTODY_ADDRESS: {
    isOk: false,
    value: 2_207n
  },
  ERR_NOT_STANDARD_PRINCIPAL: {
    isOk: false,
    value: 2_219n
  },
  ERR_NOT_SUPPORTED_ASSET: {
    isOk: false,
    value: 2_208n
  },
  ERR_NOT_WHITELISTED: {
    isOk: false,
    value: 2_216n
  },
  ERR_NO_REQUEST_FOR_ID: {
    isOk: false,
    value: 2_201n
  },
  ERR_ORACLE_CONF_TOO_LOW: {
    isOk: false,
    value: 2_218n
  },
  ERR_PRICE_FEED_MISMATCH: {
    isOk: false,
    value: 2_210n
  },
  ERR_PRICE_OUT_OF_RANGE: {
    isOk: false,
    value: 2_212n
  },
  ERR_SLIPPAGE_TOO_HIGH: {
    isOk: false,
    value: 2_206n
  },
  ERR_STALE_DATA: {
    isOk: false,
    value: 2_211n
  },
  ERR_TRADING_DISABLED: {
    isOk: false,
    value: 2_203n
  },
  blockDelay: 1n,
  bpsBase: 10_000n,
  currentMintId: 0n,
  currentMintLimit: 10_000_000_000_000n,
  currentRedeemId: 0n,
  lastMintLimitReset: 0n,
  maxBlockDelay: 10n,
  maxMintLimit: 25_000_000_000_000n,
  maxPriceDeviation: 50n,
  minMintLimitResetWindow: 3_600n,
  mintLimit: 10_000_000_000_000n,
  mintLimitResetWindow: 3_600n,
  priceBase: 100_000_000n,
  thisContract: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-vars',
  usdhBase: 100_000_000n
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch32","clarity_version":"Clarity3",
  contractName: 'minting',
  },
mintingAuto: {
  "functions": {
    checkConfidence: {"name":"check-confidence","access":"private","args":[{"name":"price","type":"uint128"},{"name":"conf","type":"uint128"},{"name":"conf-tolerance-bps","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[price: TypedAbiArg<number | bigint, "price">, conf: TypedAbiArg<number | bigint, "conf">, confToleranceBps: TypedAbiArg<number | bigint, "confToleranceBps">], Response<boolean, bigint>>,
    mint: {"name":"mint","access":"public","args":[{"name":"minting-asset","type":"trait_reference"},{"name":"amount-usdh-requested","type":"uint128"},{"name":"price-slippage-tolerance","type":"uint128"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}},{"name":"price-feed-bytes","type":{"optional":{"buffer":{"length":8192}}}},{"name":"execution-plan","type":{"tuple":[{"name":"pyth-decoder-contract","type":"trait_reference"},{"name":"pyth-storage-contract","type":"trait_reference"},{"name":"wormhole-core-contract","type":"trait_reference"}]}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[mintingAsset: TypedAbiArg<string, "mintingAsset">, amountUsdhRequested: TypedAbiArg<number | bigint, "amountUsdhRequested">, priceSlippageTolerance: TypedAbiArg<number | bigint, "priceSlippageTolerance">, memo: TypedAbiArg<Uint8Array | null, "memo">, priceFeedBytes: TypedAbiArg<Uint8Array | null, "priceFeedBytes">, executionPlan: TypedAbiArg<{
  "pythDecoderContract": string;
  "pythStorageContract": string;
  "wormholeCoreContract": string;
}, "executionPlan">], Response<boolean, bigint>>,
    redeem: {"name":"redeem","access":"public","args":[{"name":"redeeming-asset","type":"trait_reference"},{"name":"amount-usdh-requested","type":"uint128"},{"name":"price-slippage-tolerance","type":"uint128"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}},{"name":"price-feed-bytes","type":{"optional":{"buffer":{"length":8192}}}},{"name":"execution-plan","type":{"tuple":[{"name":"pyth-decoder-contract","type":"trait_reference"},{"name":"pyth-storage-contract","type":"trait_reference"},{"name":"wormhole-core-contract","type":"trait_reference"}]}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[redeemingAsset: TypedAbiArg<string, "redeemingAsset">, amountUsdhRequested: TypedAbiArg<number | bigint, "amountUsdhRequested">, priceSlippageTolerance: TypedAbiArg<number | bigint, "priceSlippageTolerance">, memo: TypedAbiArg<Uint8Array | null, "memo">, priceFeedBytes: TypedAbiArg<Uint8Array | null, "priceFeedBytes">, executionPlan: TypedAbiArg<{
  "pythDecoderContract": string;
  "pythStorageContract": string;
  "wormholeCoreContract": string;
}, "executionPlan">], Response<boolean, bigint>>,
    setMintLimit: {"name":"set-mint-limit","access":"public","args":[{"name":"new-mint-limit","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newMintLimit: TypedAbiArg<number | bigint, "newMintLimit">], Response<boolean, bigint>>,
    setMintLimitResetWindow: {"name":"set-mint-limit-reset-window","access":"public","args":[{"name":"new-window","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newWindow: TypedAbiArg<number | bigint, "newWindow">], Response<boolean, bigint>>,
    getCurrentMintLimit: {"name":"get-current-mint-limit","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getLastMintLimitReset: {"name":"get-last-mint-limit-reset","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMintLimit: {"name":"get-mint-limit","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMintLimitResetWindow: {"name":"get-mint-limit-reset-window","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>
  },
  "maps": {
    
  },
  "variables": {
    ERR_ABOVE_MAX: {
  name: 'ERR_ABOVE_MAX',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_AMOUNT_ASSET_REQUIRED_IS_ZERO: {
  name: 'ERR_AMOUNT_ASSET_REQUIRED_IS_ZERO',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_BELOW_MIN: {
  name: 'ERR_BELOW_MIN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MINT_LIMIT_EXCEEDED: {
  name: 'ERR_MINT_LIMIT_EXCEEDED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_SUPPORTED_ASSET: {
  name: 'ERR_NOT_SUPPORTED_ASSET',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_WHITELISTED: {
  name: 'ERR_NOT_WHITELISTED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_ORACLE_CONF_TOO_LOW: {
  name: 'ERR_ORACLE_CONF_TOO_LOW',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_PRICE_FEED_MISMATCH: {
  name: 'ERR_PRICE_FEED_MISMATCH',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_PRICE_SLIPPAGE_TOO_HIGH: {
  name: 'ERR_PRICE_SLIPPAGE_TOO_HIGH',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_STALE_DATA: {
  name: 'ERR_STALE_DATA',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_TRADING_DISABLED: {
  name: 'ERR_TRADING_DISABLED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    bpsBase: {
  name: 'bps-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    maxMintLimit: {
  name: 'max-mint-limit',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    minMintLimitResetWindow: {
  name: 'min-mint-limit-reset-window',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    usdhBase: {
  name: 'usdh-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    currentMintLimit: {
  name: 'current-mint-limit',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    lastMintLimitReset: {
  name: 'last-mint-limit-reset',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    mintLimit: {
  name: 'mint-limit',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    mintLimitResetWindow: {
  name: 'mint-limit-reset-window',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>
  },
  constants: {
  ERR_ABOVE_MAX: {
    isOk: false,
    value: 2_306n
  },
  ERR_AMOUNT_ASSET_REQUIRED_IS_ZERO: {
    isOk: false,
    value: 2_310n
  },
  ERR_BELOW_MIN: {
    isOk: false,
    value: 2_307n
  },
  ERR_MINT_LIMIT_EXCEEDED: {
    isOk: false,
    value: 2_305n
  },
  ERR_NOT_SUPPORTED_ASSET: {
    isOk: false,
    value: 2_302n
  },
  ERR_NOT_WHITELISTED: {
    isOk: false,
    value: 2_308n
  },
  ERR_ORACLE_CONF_TOO_LOW: {
    isOk: false,
    value: 2_311n
  },
  ERR_PRICE_FEED_MISMATCH: {
    isOk: false,
    value: 2_303n
  },
  ERR_PRICE_SLIPPAGE_TOO_HIGH: {
    isOk: false,
    value: 2_309n
  },
  ERR_STALE_DATA: {
    isOk: false,
    value: 2_304n
  },
  ERR_TRADING_DISABLED: {
    isOk: false,
    value: 2_301n
  },
  bpsBase: 10_000n,
  currentMintLimit: 50_000_000_000_000n,
  lastMintLimitReset: 1_757_221_858n,
  maxMintLimit: 100_000_000_000_000n,
  minMintLimitResetWindow: 60n,
  mintLimit: 50_000_000_000_000n,
  mintLimitResetWindow: 600n,
  usdhBase: 100_000_000n
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch32","clarity_version":"Clarity3",
  contractName: 'minting-auto',
  },
mintingAutoState: {
  "functions": {
    setFeeAddress: {"name":"set-fee-address","access":"public","args":[{"name":"new-fee-address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newFeeAddress: TypedAbiArg<string, "newFeeAddress">], Response<boolean, bigint>>,
    setMintFee: {"name":"set-mint-fee","access":"public","args":[{"name":"new-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newFee: TypedAbiArg<number | bigint, "newFee">], Response<boolean, bigint>>,
    setRedeemFee: {"name":"set-redeem-fee","access":"public","args":[{"name":"new-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newFee: TypedAbiArg<number | bigint, "newFee">], Response<boolean, bigint>>,
    setSupportedAsset: {"name":"set-supported-asset","access":"public","args":[{"name":"token","type":"trait_reference"},{"name":"active","type":"bool"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"conf-tolerance-bps","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[token: TypedAbiArg<string, "token">, active: TypedAbiArg<boolean, "active">, priceFeedId: TypedAbiArg<Uint8Array, "priceFeedId">, confToleranceBps: TypedAbiArg<number | bigint, "confToleranceBps">], Response<boolean, bigint>>,
    setWhitelist: {"name":"set-whitelist","access":"public","args":[{"name":"address","type":"principal"},{"name":"asset","type":"principal"},{"name":"minter","type":"bool"},{"name":"redeemer","type":"bool"},{"name":"block-delay","type":"uint128"},{"name":"price-slippage","type":"uint128"},{"name":"custody-address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, asset: TypedAbiArg<string, "asset">, minter: TypedAbiArg<boolean, "minter">, redeemer: TypedAbiArg<boolean, "redeemer">, blockDelay: TypedAbiArg<number | bigint, "blockDelay">, priceSlippage: TypedAbiArg<number | bigint, "priceSlippage">, custodyAddress: TypedAbiArg<string, "custodyAddress">], Response<boolean, bigint>>,
    checkIsSupportedAsset: {"name":"check-is-supported-asset","access":"read_only","args":[{"name":"contract","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[contract: TypedAbiArg<string, "contract">], boolean>,
    getFeeAddress: {"name":"get-fee-address","access":"read_only","args":[],"outputs":{"type":"principal"}} as TypedAbiFunction<[], string>,
    getMintFee: {"name":"get-mint-fee","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getRedeemFee: {"name":"get-redeem-fee","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getState: {"name":"get-state","access":"read_only","args":[{"name":"caller-address","type":"principal"},{"name":"asset-contract","type":"principal"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"block-delay","type":"uint128"},{"name":"conf-tolerance-bps","type":"uint128"},{"name":"custody-address","type":{"optional":"principal"}},{"name":"fee-address","type":"principal"},{"name":"is-active-asset","type":"bool"},{"name":"is-minter","type":"bool"},{"name":"is-redeemer","type":"bool"},{"name":"is-supported-asset","type":"bool"},{"name":"mint-fee","type":"uint128"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"price-slippage-bps","type":"uint128"},{"name":"redeem-fee","type":"uint128"},{"name":"token-base","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[callerAddress: TypedAbiArg<string, "callerAddress">, assetContract: TypedAbiArg<string, "assetContract">], Response<{
  "blockDelay": bigint;
  "confToleranceBps": bigint;
  "custodyAddress": string | null;
  "feeAddress": string;
  "isActiveAsset": boolean;
  "isMinter": boolean;
  "isRedeemer": boolean;
  "isSupportedAsset": boolean;
  "mintFee": bigint;
  "priceFeedId": Uint8Array;
  "priceSlippageBps": bigint;
  "redeemFee": bigint;
  "tokenBase": bigint;
}, bigint>>,
    getSupportedAsset: {"name":"get-supported-asset","access":"read_only","args":[{"name":"contract","type":"principal"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"active","type":"bool"},{"name":"conf-tolerance-bps","type":"uint128"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"token-base","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[contract: TypedAbiArg<string, "contract">], Response<{
  "active": boolean;
  "confToleranceBps": bigint;
  "priceFeedId": Uint8Array;
  "tokenBase": bigint;
}, bigint>>,
    getWhitelist: {"name":"get-whitelist","access":"read_only","args":[{"name":"address","type":"principal"},{"name":"asset","type":"principal"}],"outputs":{"type":{"tuple":[{"name":"block-delay","type":"uint128"},{"name":"custody-address","type":{"optional":"principal"}},{"name":"minter","type":"bool"},{"name":"price-slippage","type":"uint128"},{"name":"redeemer","type":"bool"}]}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, asset: TypedAbiArg<string, "asset">], {
  "blockDelay": bigint;
  "custodyAddress": string | null;
  "minter": boolean;
  "priceSlippage": bigint;
  "redeemer": boolean;
}>
  },
  "maps": {
    supportedAssets: {"name":"supported-assets","key":{"tuple":[{"name":"contract","type":"principal"}]},"value":{"tuple":[{"name":"active","type":"bool"},{"name":"conf-tolerance-bps","type":"uint128"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"token-base","type":"uint128"}]}} as TypedAbiMap<{
  "contract": string;
}, {
  "active": boolean;
  "confToleranceBps": bigint;
  "priceFeedId": Uint8Array;
  "tokenBase": bigint;
}>,
    whitelist: {"name":"whitelist","key":{"tuple":[{"name":"address","type":"principal"},{"name":"asset","type":"principal"}]},"value":{"tuple":[{"name":"block-delay","type":"uint128"},{"name":"custody-address","type":{"optional":"principal"}},{"name":"minter","type":"bool"},{"name":"price-slippage","type":"uint128"},{"name":"redeemer","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
  "asset": string;
}, {
  "blockDelay": bigint;
  "custodyAddress": string | null;
  "minter": boolean;
  "priceSlippage": bigint;
  "redeemer": boolean;
}>
  },
  "variables": {
    ERR_ABOVE_MAX: {
  name: 'ERR_ABOVE_MAX',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_BELOW_MIN: {
  name: 'ERR_BELOW_MIN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MAX_CONF_TOO_HIGH: {
  name: 'ERR_MAX_CONF_TOO_HIGH',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_STANDARD_PRINCIPAL: {
  name: 'ERR_NOT_STANDARD_PRINCIPAL',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_SUPPORTED_ASSET: {
  name: 'ERR_NOT_SUPPORTED_ASSET',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    bpsBase: {
  name: 'bps-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    maxBlockDelay: {
  name: 'max-block-delay',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    maxPriceSlippage: {
  name: 'max-price-slippage',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    usdhBase: {
  name: 'usdh-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    feeAddress: {
  name: 'fee-address',
  type: 'principal',
  access: 'variable'
} as TypedAbiVariable<string>,
    mintFee: {
  name: 'mint-fee',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    redeemFee: {
  name: 'redeem-fee',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>
  },
  constants: {
  ERR_ABOVE_MAX: {
    isOk: false,
    value: 2_402n
  },
  ERR_BELOW_MIN: {
    isOk: false,
    value: 2_403n
  },
  ERR_MAX_CONF_TOO_HIGH: {
    isOk: false,
    value: 2_404n
  },
  ERR_NOT_STANDARD_PRINCIPAL: {
    isOk: false,
    value: 2_405n
  },
  ERR_NOT_SUPPORTED_ASSET: {
    isOk: false,
    value: 2_401n
  },
  bpsBase: 10_000n,
  feeAddress: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R',
  maxBlockDelay: 10n,
  maxPriceSlippage: 1_000n,
  mintFee: 0n,
  redeemFee: 0n,
  usdhBase: 100_000_000n
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch32","clarity_version":"Clarity3",
  contractName: 'minting-auto-state',
  },
mintingAutoTrait: {
  "functions": {
    
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch32","clarity_version":"Clarity3",
  contractName: 'minting-auto-trait',
  },
mintingOtc: {
  "functions": {
    cancelRedeemRequest: {"name":"cancel-redeem-request","access":"public","args":[{"name":"request-id","type":{"string-ascii":{"length":36}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[requestId: TypedAbiArg<string, "requestId">], Response<boolean, bigint>>,
    cancelRedeemRequestMany: {"name":"cancel-redeem-request-many","access":"public","args":[{"name":"entries","type":{"list":{"type":{"string-ascii":{"length":36}},"length":1000}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":1000}},"error":"none"}}}} as TypedAbiFunction<[entries: TypedAbiArg<string[], "entries">], Response<Response<boolean, bigint>[], null>>,
    claimUnconfirmedRedeem: {"name":"claim-unconfirmed-redeem","access":"public","args":[{"name":"request-id","type":{"string-ascii":{"length":36}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[requestId: TypedAbiArg<string, "requestId">], Response<boolean, bigint>>,
    confirmMint: {"name":"confirm-mint","access":"public","args":[{"name":"request-id","type":{"string-ascii":{"length":36}}},{"name":"requester","type":"principal"},{"name":"amount-usdh","type":"uint128"},{"name":"price","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[requestId: TypedAbiArg<string, "requestId">, requester: TypedAbiArg<string, "requester">, amountUsdh: TypedAbiArg<number | bigint, "amountUsdh">, price: TypedAbiArg<number | bigint, "price">], Response<boolean, bigint>>,
    confirmRedeem: {"name":"confirm-redeem","access":"public","args":[{"name":"request-id","type":{"string-ascii":{"length":36}}},{"name":"price","type":"uint128"},{"name":"amount-usdh","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[requestId: TypedAbiArg<string, "requestId">, price: TypedAbiArg<number | bigint, "price">, amountUsdh: TypedAbiArg<number | bigint, "amountUsdh">], Response<boolean, bigint>>,
    requestRedeem: {"name":"request-redeem","access":"public","args":[{"name":"request-id","type":{"string-ascii":{"length":36}}},{"name":"btc-address","type":{"string-ascii":{"length":64}}},{"name":"amount-usdh","type":"uint128"},{"name":"price","type":"uint128"},{"name":"slippage","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[requestId: TypedAbiArg<string, "requestId">, btcAddress: TypedAbiArg<string, "btcAddress">, amountUsdh: TypedAbiArg<number | bigint, "amountUsdh">, price: TypedAbiArg<number | bigint, "price">, slippage: TypedAbiArg<number | bigint, "slippage">], Response<boolean, bigint>>,
    setMintLimit: {"name":"set-mint-limit","access":"public","args":[{"name":"new-limit","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newLimit: TypedAbiArg<number | bigint, "newLimit">], Response<boolean, bigint>>,
    setMintLimitResetWindow: {"name":"set-mint-limit-reset-window","access":"public","args":[{"name":"new-window","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newWindow: TypedAbiArg<number | bigint, "newWindow">], Response<boolean, bigint>>,
    setTrader: {"name":"set-trader","access":"public","args":[{"name":"address","type":"principal"},{"name":"mint","type":"bool"},{"name":"redeem","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, mint: TypedAbiArg<boolean, "mint">, redeem: TypedAbiArg<boolean, "redeem">], Response<boolean, bigint>>,
    getCurrentMintLimit: {"name":"get-current-mint-limit","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getLastMintLimitReset: {"name":"get-last-mint-limit-reset","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMintLimit: {"name":"get-mint-limit","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMintLimitResetWindow: {"name":"get-mint-limit-reset-window","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMintRequestConfirmed: {"name":"get-mint-request-confirmed","access":"read_only","args":[{"name":"request-id","type":{"string-ascii":{"length":36}}}],"outputs":{"type":"bool"}} as TypedAbiFunction<[requestId: TypedAbiArg<string, "requestId">], boolean>,
    getRedeemRequest: {"name":"get-redeem-request","access":"read_only","args":[{"name":"request-id","type":{"string-ascii":{"length":36}}}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"amount-usdh","type":"uint128"},{"name":"block-height","type":"uint128"},{"name":"btc-address","type":{"string-ascii":{"length":64}}},{"name":"price","type":"uint128"},{"name":"requester","type":"principal"},{"name":"slippage","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[requestId: TypedAbiArg<string, "requestId">], Response<{
  "amountUsdh": bigint;
  "blockHeight": bigint;
  "btcAddress": string;
  "price": bigint;
  "requester": string;
  "slippage": bigint;
}, bigint>>,
    getTrader: {"name":"get-trader","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"tuple":[{"name":"minter","type":"bool"},{"name":"redeemer","type":"bool"}]}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], {
  "minter": boolean;
  "redeemer": boolean;
}>
  },
  "maps": {
    mintRequests: {"name":"mint-requests","key":{"tuple":[{"name":"request-id","type":{"string-ascii":{"length":36}}}]},"value":{"tuple":[{"name":"confirmed","type":"bool"}]}} as TypedAbiMap<{
  "requestId": string;
}, {
  "confirmed": boolean;
}>,
    redeemRequests: {"name":"redeem-requests","key":{"tuple":[{"name":"request-id","type":{"string-ascii":{"length":36}}}]},"value":{"tuple":[{"name":"amount-usdh","type":"uint128"},{"name":"block-height","type":"uint128"},{"name":"btc-address","type":{"string-ascii":{"length":64}}},{"name":"price","type":"uint128"},{"name":"requester","type":"principal"},{"name":"slippage","type":"uint128"}]}} as TypedAbiMap<{
  "requestId": string;
}, {
  "amountUsdh": bigint;
  "blockHeight": bigint;
  "btcAddress": string;
  "price": bigint;
  "requester": string;
  "slippage": bigint;
}>,
    traders: {"name":"traders","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"minter","type":"bool"},{"name":"redeemer","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "minter": boolean;
  "redeemer": boolean;
}>
  },
  "variables": {
    ERR_ABOVE_MAX: {
  name: 'ERR_ABOVE_MAX',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_ALREADY_CONFIRMED: {
  name: 'ERR_ALREADY_CONFIRMED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_AMOUNT_NOT_ALLOWED: {
  name: 'ERR_AMOUNT_NOT_ALLOWED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_BELOW_MIN: {
  name: 'ERR_BELOW_MIN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_CONFIRMATION_OPEN: {
  name: 'ERR_CONFIRMATION_OPEN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MINT_LIMIT_EXCEEDED: {
  name: 'ERR_MINT_LIMIT_EXCEEDED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_ALLOWED: {
  name: 'ERR_NOT_ALLOWED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_WHITELISTED: {
  name: 'ERR_NOT_WHITELISTED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_REQUEST_FOR_ID: {
  name: 'ERR_NO_REQUEST_FOR_ID',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_REQUEST_ID_ALREADY_EXISTS: {
  name: 'ERR_REQUEST_ID_ALREADY_EXISTS',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_SLIPPAGE_TOO_HIGH: {
  name: 'ERR_SLIPPAGE_TOO_HIGH',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_TRADING_DISABLED: {
  name: 'ERR_TRADING_DISABLED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    bpsBase: {
  name: 'bps-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    maxMintLimit: {
  name: 'max-mint-limit',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    minMintLimitResetWindow: {
  name: 'min-mint-limit-reset-window',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    oracleBase: {
  name: 'oracle-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    thisContract: {
  name: 'this-contract',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    usdhBase: {
  name: 'usdh-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    currentMintLimit: {
  name: 'current-mint-limit',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    lastMintLimitReset: {
  name: 'last-mint-limit-reset',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    mintLimit: {
  name: 'mint-limit',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    mintLimitResetWindow: {
  name: 'mint-limit-reset-window',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>
  },
  constants: {
  ERR_ABOVE_MAX: {
    isOk: false,
    value: 2_109n
  },
  ERR_ALREADY_CONFIRMED: {
    isOk: false,
    value: 2_110n
  },
  ERR_AMOUNT_NOT_ALLOWED: {
    isOk: false,
    value: 2_107n
  },
  ERR_BELOW_MIN: {
    isOk: false,
    value: 2_102n
  },
  ERR_CONFIRMATION_OPEN: {
    isOk: false,
    value: 2_105n
  },
  ERR_MINT_LIMIT_EXCEEDED: {
    isOk: false,
    value: 2_106n
  },
  ERR_NOT_ALLOWED: {
    isOk: false,
    value: 2_103n
  },
  ERR_NOT_WHITELISTED: {
    isOk: false,
    value: 2_111n
  },
  ERR_NO_REQUEST_FOR_ID: {
    isOk: false,
    value: 2_101n
  },
  ERR_REQUEST_ID_ALREADY_EXISTS: {
    isOk: false,
    value: 2_112n
  },
  ERR_SLIPPAGE_TOO_HIGH: {
    isOk: false,
    value: 2_108n
  },
  ERR_TRADING_DISABLED: {
    isOk: false,
    value: 2_104n
  },
  bpsBase: 10_000n,
  currentMintLimit: 10_000_000_000_000n,
  lastMintLimitReset: 933_210n,
  maxMintLimit: 25_000_000_000_000n,
  minMintLimitResetWindow: 6n,
  mintLimit: 10_000_000_000_000n,
  mintLimitResetWindow: 36n,
  oracleBase: 100_000_000n,
  thisContract: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.mintingOtc-vars',
  usdhBase: 100_000_000n
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch25","clarity_version":"Clarity2",
  contractName: 'minting-otc',
  },
mintingState: {
  "functions": {
    whitelistProcessor: {"name":"whitelist-processor","access":"private","args":[{"name":"entry","type":{"tuple":[{"name":"address","type":"principal"},{"name":"mint","type":"bool"},{"name":"redeem","type":"bool"}]}}],"outputs":{"type":"bool"}} as TypedAbiFunction<[entry: TypedAbiArg<{
  "address": string;
  "mint": boolean;
  "redeem": boolean;
}, "entry">], boolean>,
    whitelistRemover: {"name":"whitelist-remover","access":"private","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    addWhitelist: {"name":"add-whitelist","access":"public","args":[{"name":"entries","type":{"list":{"type":{"tuple":[{"name":"address","type":"principal"},{"name":"mint","type":"bool"},{"name":"redeem","type":"bool"}]},"length":1000}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":"bool","length":1000}},"error":"uint128"}}}} as TypedAbiFunction<[entries: TypedAbiArg<{
  "address": string;
  "mint": boolean;
  "redeem": boolean;
}[], "entries">], Response<boolean[], bigint>>,
    removeWhitelist: {"name":"remove-whitelist","access":"public","args":[{"name":"entries","type":{"list":{"type":"principal","length":1000}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":"bool","length":1000}},"error":"uint128"}}}} as TypedAbiFunction<[entries: TypedAbiArg<string[], "entries">], Response<boolean[], bigint>>,
    setFeeAddress: {"name":"set-fee-address","access":"public","args":[{"name":"new-fee-address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newFeeAddress: TypedAbiArg<string, "newFeeAddress">], Response<boolean, bigint>>,
    setGatekeeper: {"name":"set-gatekeeper","access":"public","args":[{"name":"address","type":"principal"},{"name":"active","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, active: TypedAbiArg<boolean, "active">], Response<boolean, bigint>>,
    setMinAmountUsdhRequested: {"name":"set-min-amount-usdh-requested","access":"public","args":[{"name":"new-min-amount-usdh-requested","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newMinAmountUsdhRequested: TypedAbiArg<number | bigint, "newMinAmountUsdhRequested">], Response<boolean, bigint>>,
    setMintConfirmationWindow: {"name":"set-mint-confirmation-window","access":"public","args":[{"name":"new-window","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newWindow: TypedAbiArg<number | bigint, "newWindow">], Response<boolean, bigint>>,
    setMintDisabled: {"name":"set-mint-disabled","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    setMintEnabled: {"name":"set-mint-enabled","access":"public","args":[{"name":"mint-enabled-set","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[mintEnabledSet: TypedAbiArg<boolean, "mintEnabledSet">], Response<boolean, bigint>>,
    setMintFeeAsset: {"name":"set-mint-fee-asset","access":"public","args":[{"name":"new-mint-fee-asset","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newMintFeeAsset: TypedAbiArg<number | bigint, "newMintFeeAsset">], Response<boolean, bigint>>,
    setMintFeeUsdh: {"name":"set-mint-fee-usdh","access":"public","args":[{"name":"new-mint-fee-usdh","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newMintFeeUsdh: TypedAbiArg<number | bigint, "newMintFeeUsdh">], Response<boolean, bigint>>,
    setRedeemConfirmationWindow: {"name":"set-redeem-confirmation-window","access":"public","args":[{"name":"new-window","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newWindow: TypedAbiArg<number | bigint, "newWindow">], Response<boolean, bigint>>,
    setRedeemDisabled: {"name":"set-redeem-disabled","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    setRedeemEnabled: {"name":"set-redeem-enabled","access":"public","args":[{"name":"redeem-enabled-set","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[redeemEnabledSet: TypedAbiArg<boolean, "redeemEnabledSet">], Response<boolean, bigint>>,
    setRedeemFeeAsset: {"name":"set-redeem-fee-asset","access":"public","args":[{"name":"new-redeem-fee-asset","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newRedeemFeeAsset: TypedAbiArg<number | bigint, "newRedeemFeeAsset">], Response<boolean, bigint>>,
    setRedeemFeeUsdh: {"name":"set-redeem-fee-usdh","access":"public","args":[{"name":"new-redeem-fee-usdh","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newRedeemFeeUsdh: TypedAbiArg<number | bigint, "newRedeemFeeUsdh">], Response<boolean, bigint>>,
    setTradingDisabled: {"name":"set-trading-disabled","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    setWhitelistEnabled: {"name":"set-whitelist-enabled","access":"public","args":[{"name":"whitelist-enabled-set","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[whitelistEnabledSet: TypedAbiArg<boolean, "whitelistEnabledSet">], Response<boolean, bigint>>,
    checkIsGatekeeper: {"name":"check-is-gatekeeper","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    checkIsMinter: {"name":"check-is-minter","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    checkIsRedeemer: {"name":"check-is-redeemer","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getConfirmMintState: {"name":"get-confirm-mint-state","access":"read_only","args":[],"outputs":{"type":{"tuple":[{"name":"fee-address","type":"principal"},{"name":"mint-enabled","type":"bool"},{"name":"mint-fee-asset","type":"uint128"},{"name":"mint-fee-usdh","type":"uint128"}]}}} as TypedAbiFunction<[], {
  "feeAddress": string;
  "mintEnabled": boolean;
  "mintFeeAsset": bigint;
  "mintFeeUsdh": bigint;
}>,
    getConfirmRedeemState: {"name":"get-confirm-redeem-state","access":"read_only","args":[],"outputs":{"type":{"tuple":[{"name":"fee-address","type":"principal"},{"name":"redeem-enabled","type":"bool"},{"name":"redeem-fee-asset","type":"uint128"},{"name":"redeem-fee-usdh","type":"uint128"}]}}} as TypedAbiFunction<[], {
  "feeAddress": string;
  "redeemEnabled": boolean;
  "redeemFeeAsset": bigint;
  "redeemFeeUsdh": bigint;
}>,
    getFeeAddress: {"name":"get-fee-address","access":"read_only","args":[],"outputs":{"type":"principal"}} as TypedAbiFunction<[], string>,
    getGatekeeperActive: {"name":"get-gatekeeper-active","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getMinAmountUsdhRequested: {"name":"get-min-amount-usdh-requested","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMintConfirmationWindow: {"name":"get-mint-confirmation-window","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMintEnabled: {"name":"get-mint-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getMintFeeAsset: {"name":"get-mint-fee-asset","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMintFeeUsdh: {"name":"get-mint-fee-usdh","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getRedeemConfirmationWindow: {"name":"get-redeem-confirmation-window","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getRedeemEnabled: {"name":"get-redeem-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getRedeemFeeAsset: {"name":"get-redeem-fee-asset","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getRedeemFeeUsdh: {"name":"get-redeem-fee-usdh","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getRequestMintState: {"name":"get-request-mint-state","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"tuple":[{"name":"min-amount-usdh","type":"uint128"},{"name":"mint-enabled","type":"bool"},{"name":"whitelisted","type":"bool"}]}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], {
  "minAmountUsdh": bigint;
  "mintEnabled": boolean;
  "whitelisted": boolean;
}>,
    getRequestRedeemState: {"name":"get-request-redeem-state","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"tuple":[{"name":"min-amount-usdh","type":"uint128"},{"name":"redeem-enabled","type":"bool"},{"name":"whitelisted","type":"bool"}]}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], {
  "minAmountUsdh": bigint;
  "redeemEnabled": boolean;
  "whitelisted": boolean;
}>,
    getWhitelist: {"name":"get-whitelist","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"tuple":[{"name":"minter","type":"bool"},{"name":"redeemer","type":"bool"}]}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], {
  "minter": boolean;
  "redeemer": boolean;
}>,
    getWhitelistEnabled: {"name":"get-whitelist-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>
  },
  "maps": {
    gatekeepers: {"name":"gatekeepers","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"active","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "active": boolean;
}>,
    whitelist: {"name":"whitelist","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"minter","type":"bool"},{"name":"redeemer","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "minter": boolean;
  "redeemer": boolean;
}>
  },
  "variables": {
    ERR_ABOVE_MAX: {
  name: 'ERR_ABOVE_MAX',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_GATEKEEPER: {
  name: 'ERR_NOT_GATEKEEPER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    maxConfirmationWindow: {
  name: 'max-confirmation-window',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    maxFee: {
  name: 'max-fee',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    usdhBase: {
  name: 'usdh-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    feeAddress: {
  name: 'fee-address',
  type: 'principal',
  access: 'variable'
} as TypedAbiVariable<string>,
    minAmountUsdhRequested: {
  name: 'min-amount-usdh-requested',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    mintConfirmationWindow: {
  name: 'mint-confirmation-window',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    mintEnabled: {
  name: 'mint-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    mintFeeAsset: {
  name: 'mint-fee-asset',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    mintFeeUsdh: {
  name: 'mint-fee-usdh',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    redeemConfirmationWindow: {
  name: 'redeem-confirmation-window',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    redeemEnabled: {
  name: 'redeem-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    redeemFeeAsset: {
  name: 'redeem-fee-asset',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    redeemFeeUsdh: {
  name: 'redeem-fee-usdh',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    whitelistEnabled: {
  name: 'whitelist-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>
  },
  constants: {
  ERR_ABOVE_MAX: {
    isOk: false,
    value: 2_002n
  },
  ERR_NOT_GATEKEEPER: {
    isOk: false,
    value: 2_001n
  },
  feeAddress: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R',
  maxConfirmationWindow: 144n,
  maxFee: 200n,
  minAmountUsdhRequested: 100_000_000_000n,
  mintConfirmationWindow: 10n,
  mintEnabled: true,
  mintFeeAsset: 0n,
  mintFeeUsdh: 0n,
  redeemConfirmationWindow: 10n,
  redeemEnabled: true,
  redeemFeeAsset: 0n,
  redeemFeeUsdh: 0n,
  usdhBase: 100_000_000n,
  whitelistEnabled: true
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch25","clarity_version":"Clarity2",
  contractName: 'minting-state',
  },
redeemingReserve: {
  "functions": {
    setAuthorizedRecipient: {"name":"set-authorized-recipient","access":"public","args":[{"name":"address","type":"principal"},{"name":"active","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, active: TypedAbiArg<boolean, "active">], Response<boolean, bigint>>,
    setManager: {"name":"set-manager","access":"public","args":[{"name":"address","type":"principal"},{"name":"active","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, active: TypedAbiArg<boolean, "active">], Response<boolean, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"},{"name":"redeeming-asset","type":"trait_reference"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, recipient: TypedAbiArg<string, "recipient">, redeemingAsset: TypedAbiArg<string, "redeemingAsset">, memo: TypedAbiArg<Uint8Array | null, "memo">], Response<boolean, bigint>>,
    getAuthorizedRecipient: {"name":"get-authorized-recipient","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"tuple":[{"name":"active","type":"bool"}]}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], {
  "active": boolean;
}>,
    getManager: {"name":"get-manager","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"tuple":[{"name":"active","type":"bool"}]}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], {
  "active": boolean;
}>
  },
  "maps": {
    authorizedRecipients: {"name":"authorized-recipients","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"active","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "active": boolean;
}>,
    managers: {"name":"managers","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"active","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "active": boolean;
}>
  },
  "variables": {
    ERR_NOT_AUTHORIZED_CALLER: {
  name: 'ERR_NOT_AUTHORIZED_CALLER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_AUTHORIZED_RECIPIENT: {
  name: 'ERR_NOT_AUTHORIZED_RECIPIENT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_STANDARD_PRINCIPAL: {
  name: 'ERR_NOT_STANDARD_PRINCIPAL',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>
  },
  constants: {
  ERR_NOT_AUTHORIZED_CALLER: {
    isOk: false,
    value: 9_001n
  },
  ERR_NOT_AUTHORIZED_RECIPIENT: {
    isOk: false,
    value: 9_003n
  },
  ERR_NOT_STANDARD_PRINCIPAL: {
    isOk: false,
    value: 9_002n
  }
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch32","clarity_version":"Clarity2",
  contractName: 'redeeming-reserve',
  },
reserve: {
  "functions": {
    transfer: {"name":"transfer","access":"public","args":[{"name":"asset","type":"trait_reference"},{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[asset: TypedAbiArg<string, "asset">, amount: TypedAbiArg<number | bigint, "amount">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_INSUFFICIENT_BALANCE: {
  name: 'ERR_INSUFFICIENT_BALANCE',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>
  },
  constants: {
  ERR_INSUFFICIENT_BALANCE: {
    isOk: false,
    value: 105_001n
  }
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'reserve',
  },
reserveFund: {
  "functions": {
    transfer: {"name":"transfer","access":"public","args":[{"name":"asset","type":"trait_reference"},{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[asset: TypedAbiArg<string, "asset">, amount: TypedAbiArg<number | bigint, "amount">, recipient: TypedAbiArg<string, "recipient">, memo: TypedAbiArg<Uint8Array | null, "memo">], Response<boolean, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_INSUFFICIENT_BALANCE: {
  name: 'ERR_INSUFFICIENT_BALANCE',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>
  },
  constants: {
  ERR_INSUFFICIENT_BALANCE: {
    isOk: false,
    value: 106_001n
  }
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'reserve-fund',
  },
sip010Trait: {
  "functions": {
    
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch25","clarity_version":"Clarity2",
  contractName: 'sip-010-trait',
  },
staking: {
  "functions": {
    stake: {"name":"stake","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"affiliate","type":{"optional":{"buffer":{"length":64}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, affiliate: TypedAbiArg<Uint8Array | null, "affiliate">], Response<boolean, bigint>>,
    unstake: {"name":"unstake","access":"public","args":[{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">], Response<bigint, bigint>>,
    getUsdhPerSusdh: {"name":"get-usdh-per-susdh","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_INVALID_AMOUNT: {
  name: 'ERR_INVALID_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    usdhBase: {
  name: 'usdh-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>
  },
  constants: {
  ERR_INVALID_AMOUNT: {
    isOk: false,
    value: 3_001n
  },
  usdhBase: 100_000_000n
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch32","clarity_version":"Clarity2",
  contractName: 'staking',
  },
stakingReserve: {
  "functions": {
    transfer: {"name":"transfer","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch32","clarity_version":"Clarity3",
  contractName: 'staking-reserve',
  },
stakingSilo: {
  "functions": {
    createClaim: {"name":"create-claim","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, recipient: TypedAbiArg<string, "recipient">], Response<bigint, bigint>>,
    withdraw: {"name":"withdraw","access":"public","args":[{"name":"claim-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[claimId: TypedAbiArg<number | bigint, "claimId">], Response<boolean, bigint>>,
    withdrawMany: {"name":"withdraw-many","access":"public","args":[{"name":"entries","type":{"list":{"type":"uint128","length":1000}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":1000}},"error":"none"}}}} as TypedAbiFunction<[entries: TypedAbiArg<number | bigint[], "entries">], Response<Response<boolean, bigint>[], null>>,
    getClaim: {"name":"get-claim","access":"read_only","args":[{"name":"id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"},{"name":"ts","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], Response<{
  "amount": bigint;
  "recipient": string;
  "ts": bigint;
}, bigint>>,
    getCurrentClaimId: {"name":"get-current-claim-id","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getCurrentTs: {"name":"get-current-ts","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>
  },
  "maps": {
    claims: {"name":"claims","key":{"tuple":[{"name":"claim-id","type":"uint128"}]},"value":{"tuple":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"},{"name":"ts","type":"uint128"}]}} as TypedAbiMap<{
  "claimId": number | bigint;
}, {
  "amount": bigint;
  "recipient": string;
  "ts": bigint;
}>
  },
  "variables": {
    ERR_INVALID_AMOUNT: {
  name: 'ERR_INVALID_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_COOLED_DOWN: {
  name: 'ERR_NOT_COOLED_DOWN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_CLAIM_FOR_ID: {
  name: 'ERR_NO_CLAIM_FOR_ID',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_ONLY_STAKING_CONTRACT: {
  name: 'ERR_ONLY_STAKING_CONTRACT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    currentClaimId: {
  name: 'current-claim-id',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>
  },
  constants: {
  ERR_INVALID_AMOUNT: {
    isOk: false,
    value: 3_104n
  },
  ERR_NOT_COOLED_DOWN: {
    isOk: false,
    value: 3_102n
  },
  ERR_NO_CLAIM_FOR_ID: {
    isOk: false,
    value: 3_101n
  },
  ERR_ONLY_STAKING_CONTRACT: {
    isOk: false,
    value: 3_103n
  },
  currentClaimId: 0n
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch32","clarity_version":"Clarity3",
  contractName: 'staking-silo',
  },
stakingSiloTrait: {
  "functions": {
    
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch32","clarity_version":"Clarity3",
  contractName: 'staking-silo-trait',
  },
stakingState: {
  "functions": {
    setCooldownWindow: {"name":"set-cooldown-window","access":"public","args":[{"name":"new-window","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newWindow: TypedAbiArg<number | bigint, "newWindow">], Response<boolean, bigint>>,
    setCustomCooldown: {"name":"set-custom-cooldown","access":"public","args":[{"name":"principal","type":"principal"},{"name":"new-window","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[principal: TypedAbiArg<string, "principal">, newWindow: TypedAbiArg<number | bigint, "newWindow">], Response<boolean, bigint>>,
    setStakingEnabled: {"name":"set-staking-enabled","access":"public","args":[{"name":"new-enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newEnabled: TypedAbiArg<boolean, "newEnabled">], Response<boolean, bigint>>,
    checkIsStakingEnabled: {"name":"check-is-staking-enabled","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    getCooldownWindow: {"name":"get-cooldown-window","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getCustomCooldown: {"name":"get-custom-cooldown","access":"read_only","args":[{"name":"principal","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[principal: TypedAbiArg<string, "principal">], bigint>,
    getStakingEnabled: {"name":"get-staking-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>
  },
  "maps": {
    customCooldown: {"name":"custom-cooldown","key":{"tuple":[{"name":"principal","type":"principal"}]},"value":{"tuple":[{"name":"cooldown-window","type":"uint128"}]}} as TypedAbiMap<{
  "principal": string;
}, {
  "cooldownWindow": bigint;
}>
  },
  "variables": {
    ERR_ABOVE_MAX: {
  name: 'ERR_ABOVE_MAX',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_STAKING_DISABLED: {
  name: 'ERR_STAKING_DISABLED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    maxCooldownWindow: {
  name: 'max-cooldown-window',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    cooldownWindow: {
  name: 'cooldown-window',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    stakingEnabled: {
  name: 'staking-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>
  },
  constants: {
  ERR_ABOVE_MAX: {
    isOk: false,
    value: 3_201n
  },
  ERR_STAKING_DISABLED: {
    isOk: false,
    value: 3_202n
  },
  cooldownWindow: 604_800n,
  maxCooldownWindow: 2_592_000n,
  stakingEnabled: true
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch32","clarity_version":"Clarity3",
  contractName: 'staking-state',
  },
stakingTrait: {
  "functions": {
    
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch32","clarity_version":"Clarity3",
  contractName: 'staking-trait',
  },
state: {
  "functions": {
    cancelMapUpdate: {"name":"cancel-map-update","access":"private","args":[{"name":"type","type":{"buffer":{"length":1}}},{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">, address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    cancelUpdate: {"name":"cancel-update","access":"private","args":[{"name":"type","type":{"buffer":{"length":1}}},{"name":"address","type":{"optional":"principal"}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">, address: TypedAbiArg<string | null, "address">], Response<boolean, bigint>>,
    cancelVarUpdate: {"name":"cancel-var-update","access":"private","args":[{"name":"type","type":{"buffer":{"length":1}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">], Response<boolean, bigint>>,
    confirmMapUpdate: {"name":"confirm-map-update","access":"private","args":[{"name":"type","type":{"buffer":{"length":1}}},{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">, address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    confirmUpdate: {"name":"confirm-update","access":"private","args":[{"name":"type","type":{"buffer":{"length":1}}},{"name":"address","type":{"optional":"principal"}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">, address: TypedAbiArg<string | null, "address">], Response<boolean, bigint>>,
    confirmVarUpdate: {"name":"confirm-var-update","access":"private","args":[{"name":"type","type":{"buffer":{"length":1}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">], Response<boolean, bigint>>,
    consumeExpressLimit: {"name":"consume-express-limit","access":"private","args":[{"name":"shares","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[shares: TypedAbiArg<number | bigint, "shares">], Response<boolean, bigint>>,
    executeMapUpdate: {"name":"execute-map-update","access":"private","args":[{"name":"type","type":{"buffer":{"length":1}}},{"name":"addr","type":"principal"},{"name":"is-add","type":"bool"},{"name":"asset-config","type":{"optional":{"tuple":[{"name":"is-stablecoin","type":"bool"},{"name":"max-slippage","type":"uint128"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"token-base","type":"uint128"}]}}}],"outputs":{"type":"bool"}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">, addr: TypedAbiArg<string, "addr">, isAdd: TypedAbiArg<boolean, "isAdd">, assetConfig: TypedAbiArg<{
  "isStablecoin": boolean;
  "maxSlippage": number | bigint;
  "priceFeedId": Uint8Array;
  "tokenBase": number | bigint;
} | null, "assetConfig">], boolean>,
    executeUpdate: {"name":"execute-update","access":"private","args":[{"name":"op","type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"is-add","type":"bool"},{"name":"type","type":{"string-ascii":{"length":14}}}]}},{"name":"prev","type":{"response":{"ok":"bool","error":"uint128"}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[op: TypedAbiArg<{
  "amount": number | bigint;
  "isAdd": boolean;
  "type": string;
}, "op">, prev: TypedAbiArg<Response<boolean, number | bigint>, "prev">], Response<boolean, bigint>>,
    executeVarUpdate: {"name":"execute-var-update","access":"private","args":[{"name":"type","type":{"buffer":{"length":1}}},{"name":"val","type":"uint128"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">, val: TypedAbiArg<number | bigint, "val">], boolean>,
    removeCustomExitFeeIter: {"name":"remove-custom-exit-fee-iter","access":"private","args":[{"name":"address","type":"principal"},{"name":"prev","type":{"response":{"ok":"bool","error":"uint128"}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, prev: TypedAbiArg<Response<boolean, number | bigint>, "prev">], Response<boolean, bigint>>,
    requestMapUpdate: {"name":"request-map-update","access":"private","args":[{"name":"type","type":{"buffer":{"length":1}}},{"name":"address","type":"principal"},{"name":"is-add","type":"bool"},{"name":"asset-config","type":{"optional":{"tuple":[{"name":"is-stablecoin","type":"bool"},{"name":"max-slippage","type":"uint128"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"token-base","type":"uint128"}]}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">, address: TypedAbiArg<string, "address">, isAdd: TypedAbiArg<boolean, "isAdd">, assetConfig: TypedAbiArg<{
  "isStablecoin": boolean;
  "maxSlippage": number | bigint;
  "priceFeedId": Uint8Array;
  "tokenBase": number | bigint;
} | null, "assetConfig">], Response<boolean, bigint>>,
    requestUpdate: {"name":"request-update","access":"private","args":[{"name":"type","type":{"buffer":{"length":1}}},{"name":"address","type":{"optional":"principal"}},{"name":"value","type":{"optional":"uint128"}},{"name":"is-add","type":"bool"},{"name":"asset-config","type":{"optional":{"tuple":[{"name":"is-stablecoin","type":"bool"},{"name":"max-slippage","type":"uint128"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"token-base","type":"uint128"}]}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">, address: TypedAbiArg<string | null, "address">, value: TypedAbiArg<number | bigint | null, "value">, isAdd: TypedAbiArg<boolean, "isAdd">, assetConfig: TypedAbiArg<{
  "isStablecoin": boolean;
  "maxSlippage": number | bigint;
  "priceFeedId": Uint8Array;
  "tokenBase": number | bigint;
} | null, "assetConfig">], Response<boolean, bigint>>,
    requestVarUpdate: {"name":"request-var-update","access":"private","args":[{"name":"type","type":{"buffer":{"length":1}}},{"name":"value","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">, value: TypedAbiArg<number | bigint, "value">], Response<boolean, bigint>>,
    setCustomExitFeeIter: {"name":"set-custom-exit-fee-iter","access":"private","args":[{"name":"entry","type":{"tuple":[{"name":"address","type":"principal"},{"name":"new-exit-fee","type":"uint128"}]}},{"name":"prev","type":{"response":{"ok":"bool","error":"uint128"}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[entry: TypedAbiArg<{
  "address": string;
  "newExitFee": number | bigint;
}, "entry">, prev: TypedAbiArg<Response<boolean, number | bigint>, "prev">], Response<boolean, bigint>>,
    updateLastLogTs: {"name":"update-last-log-ts","access":"private","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    updatePendingFees: {"name":"update-pending-fees","access":"private","args":[{"name":"amount","type":"uint128"},{"name":"is-add","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, isAdd: TypedAbiArg<boolean, "isAdd">], Response<boolean, null>>,
    updatePendingRf: {"name":"update-pending-rf","access":"private","args":[{"name":"amount","type":"uint128"},{"name":"is-add","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, isAdd: TypedAbiArg<boolean, "isAdd">], Response<boolean, null>>,
    updateShares: {"name":"update-shares","access":"private","args":[{"name":"amount","type":"uint128"},{"name":"is-add","type":"bool"},{"name":"user","type":"principal"},{"name":"current-supply","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, isAdd: TypedAbiArg<boolean, "isAdd">, user: TypedAbiArg<string, "user">, currentSupply: TypedAbiArg<number | bigint, "currentSupply">], Response<bigint, bigint>>,
    updateTotalAssets: {"name":"update-total-assets","access":"private","args":[{"name":"amount","type":"uint128"},{"name":"is-add","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, isAdd: TypedAbiArg<boolean, "isAdd">], Response<boolean, null>>,
    cancelAssetRequest: {"name":"cancel-asset-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    cancelCooldownRequest: {"name":"cancel-cooldown-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    cancelExpressCooldownRequest: {"name":"cancel-express-cooldown-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    cancelExpressLimitRequest: {"name":"cancel-express-limit-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    cancelExpressWindowRequest: {"name":"cancel-express-window-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    cancelExternalRequest: {"name":"cancel-external-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    cancelMaxDeviationRequest: {"name":"cancel-max-deviation-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    cancelMaxRewardRequest: {"name":"cancel-max-reward-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    cancelMaxSlippageRequest: {"name":"cancel-max-slippage-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    cancelMinRedeemRequest: {"name":"cancel-min-redeem-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    cancelUpdateWindowRequest: {"name":"cancel-update-window-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    checkRedeemAuth: {"name":"check-redeem-auth","access":"public","args":[{"name":"shares","type":"uint128"},{"name":"is-express","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[shares: TypedAbiArg<number | bigint, "shares">, isExpress: TypedAbiArg<boolean, "isExpress">], Response<boolean, bigint>>,
    confirmAssetRequest: {"name":"confirm-asset-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    confirmCooldownRequest: {"name":"confirm-cooldown-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    confirmExpressCooldownRequest: {"name":"confirm-express-cooldown-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    confirmExpressLimitRequest: {"name":"confirm-express-limit-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    confirmExpressWindowRequest: {"name":"confirm-express-window-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    confirmExternalRequest: {"name":"confirm-external-request","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    confirmMaxDeviationRequest: {"name":"confirm-max-deviation-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    confirmMaxRewardRequest: {"name":"confirm-max-reward-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    confirmMaxSlippageRequest: {"name":"confirm-max-slippage-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    confirmMinRedeemRequest: {"name":"confirm-min-redeem-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    confirmUpdateWindowRequest: {"name":"confirm-update-window-request","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    disableDeposits: {"name":"disable-deposits","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    disableRedeem: {"name":"disable-redeem","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    disableReward: {"name":"disable-reward","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    disableTrading: {"name":"disable-trading","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    disableTransfer: {"name":"disable-transfer","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    disableVault: {"name":"disable-vault","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    incrementClaimId: {"name":"increment-claim-id","access":"public","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[], Response<bigint, bigint>>,
    removeCustomCooldown: {"name":"remove-custom-cooldown","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    removeCustomExitFee: {"name":"remove-custom-exit-fee","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    removeCustomExitFeeMany: {"name":"remove-custom-exit-fee-many","access":"public","args":[{"name":"addresses","type":{"list":{"type":"principal","length":200}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[addresses: TypedAbiArg<string[], "addresses">], Response<boolean, bigint>>,
    requestAssetAdd: {"name":"request-asset-add","access":"public","args":[{"name":"token","type":"trait_reference"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"decimals","type":"uint128"},{"name":"asset-max-slippage","type":"uint128"},{"name":"is-stablecoin","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[token: TypedAbiArg<string, "token">, priceFeedId: TypedAbiArg<Uint8Array, "priceFeedId">, decimals: TypedAbiArg<number | bigint, "decimals">, assetMaxSlippage: TypedAbiArg<number | bigint, "assetMaxSlippage">, isStablecoin: TypedAbiArg<boolean, "isStablecoin">], Response<boolean, bigint>>,
    requestAssetRemove: {"name":"request-asset-remove","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    requestCooldownUpdate: {"name":"request-cooldown-update","access":"public","args":[{"name":"new-value","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newValue: TypedAbiArg<number | bigint, "newValue">], Response<boolean, bigint>>,
    requestExpressCooldownUpdate: {"name":"request-express-cooldown-update","access":"public","args":[{"name":"new-value","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newValue: TypedAbiArg<number | bigint, "newValue">], Response<boolean, bigint>>,
    requestExpressLimitUpdate: {"name":"request-express-limit-update","access":"public","args":[{"name":"new-value","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newValue: TypedAbiArg<number | bigint, "newValue">], Response<boolean, bigint>>,
    requestExpressWindowUpdate: {"name":"request-express-window-update","access":"public","args":[{"name":"new-value","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newValue: TypedAbiArg<number | bigint, "newValue">], Response<boolean, bigint>>,
    requestExternalAdd: {"name":"request-external-add","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    requestExternalRemove: {"name":"request-external-remove","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    requestMaxDeviationUpdate: {"name":"request-max-deviation-update","access":"public","args":[{"name":"new-value","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newValue: TypedAbiArg<number | bigint, "newValue">], Response<boolean, bigint>>,
    requestMaxRewardUpdate: {"name":"request-max-reward-update","access":"public","args":[{"name":"new-value","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newValue: TypedAbiArg<number | bigint, "newValue">], Response<boolean, bigint>>,
    requestMaxSlippageUpdate: {"name":"request-max-slippage-update","access":"public","args":[{"name":"new-value","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newValue: TypedAbiArg<number | bigint, "newValue">], Response<boolean, bigint>>,
    requestMinRedeemUpdate: {"name":"request-min-redeem-update","access":"public","args":[{"name":"new-value","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newValue: TypedAbiArg<number | bigint, "newValue">], Response<boolean, bigint>>,
    requestUpdateWindowUpdate: {"name":"request-update-window-update","access":"public","args":[{"name":"new-value","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newValue: TypedAbiArg<number | bigint, "newValue">], Response<boolean, bigint>>,
    setAssetSlippage: {"name":"set-asset-slippage","access":"public","args":[{"name":"address","type":"principal"},{"name":"new-slippage","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, newSlippage: TypedAbiArg<number | bigint, "newSlippage">], Response<boolean, bigint>>,
    setCustomCooldown: {"name":"set-custom-cooldown","access":"public","args":[{"name":"address","type":"principal"},{"name":"new-cooldown","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, newCooldown: TypedAbiArg<number | bigint, "newCooldown">], Response<boolean, bigint>>,
    setCustomExitFee: {"name":"set-custom-exit-fee","access":"public","args":[{"name":"address","type":"principal"},{"name":"new-exit-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, newExitFee: TypedAbiArg<number | bigint, "newExitFee">], Response<boolean, bigint>>,
    setCustomExitFeeMany: {"name":"set-custom-exit-fee-many","access":"public","args":[{"name":"entries","type":{"list":{"type":{"tuple":[{"name":"address","type":"principal"},{"name":"new-exit-fee","type":"uint128"}]},"length":200}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[entries: TypedAbiArg<{
  "address": string;
  "newExitFee": number | bigint;
}[], "entries">], Response<boolean, bigint>>,
    setDepositCap: {"name":"set-deposit-cap","access":"public","args":[{"name":"new-deposit-cap","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newDepositCap: TypedAbiArg<number | bigint, "newDepositCap">], Response<boolean, bigint>>,
    setDepositEnabled: {"name":"set-deposit-enabled","access":"public","args":[{"name":"enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
    setExpressEnabled: {"name":"set-express-enabled","access":"public","args":[{"name":"enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
    setExpressLimitEnabled: {"name":"set-express-limit-enabled","access":"public","args":[{"name":"enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
    setFeeAddress: {"name":"set-fee-address","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    setFees: {"name":"set-fees","access":"public","args":[{"name":"mgmt-fee","type":"uint128"},{"name":"perf-fee","type":"uint128"},{"name":"exit-fee","type":"uint128"},{"name":"express-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[mgmtFee: TypedAbiArg<number | bigint, "mgmtFee">, perfFee: TypedAbiArg<number | bigint, "perfFee">, exitFee: TypedAbiArg<number | bigint, "exitFee">, expressFee: TypedAbiArg<number | bigint, "expressFee">], Response<boolean, bigint>>,
    setMinDeposit: {"name":"set-min-deposit","access":"public","args":[{"name":"new-min-deposit","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newMinDeposit: TypedAbiArg<number | bigint, "newMinDeposit">], Response<boolean, bigint>>,
    setRedeemEnabled: {"name":"set-redeem-enabled","access":"public","args":[{"name":"enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
    setReserveRate: {"name":"set-reserve-rate","access":"public","args":[{"name":"new-reserve-rate","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newReserveRate: TypedAbiArg<number | bigint, "newReserveRate">], Response<boolean, bigint>>,
    setRewardEnabled: {"name":"set-reward-enabled","access":"public","args":[{"name":"enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
    setStalenessWindow: {"name":"set-staleness-window","access":"public","args":[{"name":"new-staleness-window","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[newStalenessWindow: TypedAbiArg<number | bigint, "newStalenessWindow">], Response<boolean, bigint>>,
    setTradingEnabled: {"name":"set-trading-enabled","access":"public","args":[{"name":"enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
    setTransferEnabled: {"name":"set-transfer-enabled","access":"public","args":[{"name":"enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
    setVaultEnabled: {"name":"set-vault-enabled","access":"public","args":[{"name":"enabled","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[enabled: TypedAbiArg<boolean, "enabled">], Response<boolean, bigint>>,
    updateState: {"name":"update-state","access":"public","args":[{"name":"operations","type":{"list":{"type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"is-add","type":"bool"},{"name":"type","type":{"string-ascii":{"length":14}}}]},"length":10}}},{"name":"reward","type":{"optional":{"tuple":[{"name":"is-add","type":"bool"},{"name":"reward","type":"uint128"}]}}},{"name":"shares","type":{"optional":{"tuple":[{"name":"amount","type":"uint128"},{"name":"is-add","type":"bool"},{"name":"user","type":"principal"}]}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[operations: TypedAbiArg<{
  "amount": number | bigint;
  "isAdd": boolean;
  "type": string;
}[], "operations">, reward: TypedAbiArg<{
  "isAdd": boolean;
  "reward": number | bigint;
} | null, "reward">, shares: TypedAbiArg<{
  "amount": number | bigint;
  "isAdd": boolean;
  "user": string;
} | null, "shares">], Response<boolean, bigint>>,
    checkIsAsset: {"name":"check-is-asset","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    checkIsDepositEnabled: {"name":"check-is-deposit-enabled","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    checkIsExpressEnabled: {"name":"check-is-express-enabled","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    checkIsExternal: {"name":"check-is-external","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    checkIsRedeemEnabled: {"name":"check-is-redeem-enabled","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    checkIsRewardEnabled: {"name":"check-is-reward-enabled","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    checkIsTradingEnabled: {"name":"check-is-trading-enabled","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    checkIsTransferEnabled: {"name":"check-is-transfer-enabled","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    checkIsVaultEnabled: {"name":"check-is-vault-enabled","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    checkMaxDeviation: {"name":"check-max-deviation","access":"read_only","args":[{"name":"old-price","type":"uint128"},{"name":"new-price","type":"uint128"},{"name":"share-supply","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[oldPrice: TypedAbiArg<number | bigint, "oldPrice">, newPrice: TypedAbiArg<number | bigint, "newPrice">, shareSupply: TypedAbiArg<number | bigint, "shareSupply">], Response<boolean, bigint>>,
    checkMaxReward: {"name":"check-max-reward","access":"read_only","args":[{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">], Response<boolean, bigint>>,
    checkTradingAuth: {"name":"check-trading-auth","access":"read_only","args":[{"name":"address-1","type":"principal"},{"name":"address-2","type":{"optional":"principal"}},{"name":"asset-1","type":{"optional":"principal"}},{"name":"asset-2","type":{"optional":"principal"}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address1: TypedAbiArg<string, "address1">, address2: TypedAbiArg<string | null, "address2">, asset1: TypedAbiArg<string | null, "asset1">, asset2: TypedAbiArg<string | null, "asset2">], Response<boolean, bigint>>,
    checkTransferAuth: {"name":"check-transfer-auth","access":"read_only","args":[{"name":"asset","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[asset: TypedAbiArg<string, "asset">], Response<boolean, bigint>>,
    checkUpdateWindow: {"name":"check-update-window","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    convertToAssets: {"name":"convert-to-assets","access":"read_only","args":[{"name":"shares","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[shares: TypedAbiArg<number | bigint, "shares">], bigint>,
    convertToShares: {"name":"convert-to-shares","access":"read_only","args":[{"name":"assets-in","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[assetsIn: TypedAbiArg<number | bigint, "assetsIn">], bigint>,
    getAsset: {"name":"get-asset","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"tuple":[{"name":"active","type":"bool"},{"name":"is-stablecoin","type":"bool"},{"name":"max-slippage","type":"uint128"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"token-base","type":"uint128"}]}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], {
  "active": boolean;
  "isStablecoin": boolean;
  "maxSlippage": bigint;
  "priceFeedId": Uint8Array;
  "tokenBase": bigint;
}>,
    getClaimId: {"name":"get-claim-id","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getCooldown: {"name":"get-cooldown","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getCurrentExpressLimit: {"name":"get-current-express-limit","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getCustomCooldown: {"name":"get-custom-cooldown","access":"read_only","args":[{"name":"address","type":"principal"},{"name":"is-express","type":"bool"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, isExpress: TypedAbiArg<boolean, "isExpress">], bigint>,
    getCustomExitFee: {"name":"get-custom-exit-fee","access":"read_only","args":[{"name":"address","type":"principal"},{"name":"is-express","type":"bool"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">, isExpress: TypedAbiArg<boolean, "isExpress">], bigint>,
    getDepositCap: {"name":"get-deposit-cap","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getDepositEnabled: {"name":"get-deposit-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getDepositState: {"name":"get-deposit-state","access":"read_only","args":[{"name":"assets-in","type":"uint128"}],"outputs":{"type":{"tuple":[{"name":"deposit-cap","type":"uint128"},{"name":"min-deposit","type":"uint128"},{"name":"net-assets","type":"uint128"},{"name":"shares","type":"uint128"}]}}} as TypedAbiFunction<[assetsIn: TypedAbiArg<number | bigint, "assetsIn">], {
  "depositCap": bigint;
  "minDeposit": bigint;
  "netAssets": bigint;
  "shares": bigint;
}>,
    getEffectiveExpressLimit: {"name":"get-effective-express-limit","access":"read_only","args":[],"outputs":{"type":{"tuple":[{"name":"assets","type":"uint128"},{"name":"enabled","type":"bool"},{"name":"reset-ts","type":"uint128"},{"name":"shares","type":"uint128"}]}}} as TypedAbiFunction<[], {
  "assets": bigint;
  "enabled": boolean;
  "resetTs": bigint;
  "shares": bigint;
}>,
    getExpressCooldown: {"name":"get-express-cooldown","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getExpressEnabled: {"name":"get-express-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getExpressLimit: {"name":"get-express-limit","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getExpressLimitEnabled: {"name":"get-express-limit-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getExpressWindow: {"name":"get-express-window","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getExternal: {"name":"get-external","access":"read_only","args":[{"name":"address","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], boolean>,
    getFeeAddress: {"name":"get-fee-address","access":"read_only","args":[],"outputs":{"type":"principal"}} as TypedAbiFunction<[], string>,
    getFees: {"name":"get-fees","access":"read_only","args":[],"outputs":{"type":{"tuple":[{"name":"exit-fee","type":"uint128"},{"name":"express-fee","type":"uint128"},{"name":"mgmt-fee","type":"uint128"},{"name":"perf-fee","type":"uint128"}]}}} as TypedAbiFunction<[], {
  "exitFee": bigint;
  "expressFee": bigint;
  "mgmtFee": bigint;
  "perfFee": bigint;
}>,
    getLastExpressTs: {"name":"get-last-express-ts","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getLastLogTs: {"name":"get-last-log-ts","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMaxDeviation: {"name":"get-max-deviation","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMaxReward: {"name":"get-max-reward","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMaxSlippage: {"name":"get-max-slippage","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMinDeposit: {"name":"get-min-deposit","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getMinRedeem: {"name":"get-min-redeem","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getNetAssets: {"name":"get-net-assets","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getPending: {"name":"get-pending","access":"read_only","args":[],"outputs":{"type":{"tuple":[{"name":"fees","type":"uint128"},{"name":"rf","type":"uint128"}]}}} as TypedAbiFunction<[], {
  "fees": bigint;
  "rf": bigint;
}>,
    getPendingFees: {"name":"get-pending-fees","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getPendingRf: {"name":"get-pending-rf","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getRedeemEnabled: {"name":"get-redeem-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getRedeemState: {"name":"get-redeem-state","access":"read_only","args":[{"name":"user","type":"principal"},{"name":"is-express","type":"bool"}],"outputs":{"type":{"tuple":[{"name":"cooldown","type":"uint128"},{"name":"exit-fee","type":"uint128"},{"name":"min-redeem","type":"uint128"},{"name":"share-price","type":"uint128"}]}}} as TypedAbiFunction<[user: TypedAbiArg<string, "user">, isExpress: TypedAbiArg<boolean, "isExpress">], {
  "cooldown": bigint;
  "exitFee": bigint;
  "minRedeem": bigint;
  "sharePrice": bigint;
}>,
    getReserveRate: {"name":"get-reserve-rate","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getRewardEnabled: {"name":"get-reward-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getRewardState: {"name":"get-reward-state","access":"read_only","args":[],"outputs":{"type":{"tuple":[{"name":"fees","type":{"tuple":[{"name":"exit-fee","type":"uint128"},{"name":"express-fee","type":"uint128"},{"name":"mgmt-fee","type":"uint128"},{"name":"perf-fee","type":"uint128"}]}},{"name":"net-assets","type":"uint128"},{"name":"pending-rf","type":"uint128"},{"name":"reserve-rate","type":"uint128"},{"name":"total-assets","type":"uint128"}]}}} as TypedAbiFunction<[], {
  "fees": {
  "exitFee": bigint;
  "expressFee": bigint;
  "mgmtFee": bigint;
  "perfFee": bigint;
};
  "netAssets": bigint;
  "pendingRf": bigint;
  "reserveRate": bigint;
  "totalAssets": bigint;
}>,
    getSharePrice: {"name":"get-share-price","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getStalenessWindow: {"name":"get-staleness-window","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getTotalAssets: {"name":"get-total-assets","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getTradingEnabled: {"name":"get-trading-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getTransferEnabled: {"name":"get-transfer-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getUpdateRequest: {"name":"get-update-request","access":"read_only","args":[{"name":"type","type":{"buffer":{"length":1}}},{"name":"address","type":{"optional":"principal"}}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"asset-config","type":{"optional":{"tuple":[{"name":"is-stablecoin","type":"bool"},{"name":"max-slippage","type":"uint128"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"token-base","type":"uint128"}]}}},{"name":"is-add","type":"bool"},{"name":"ts","type":"uint128"},{"name":"value","type":{"optional":"uint128"}}]},"error":"uint128"}}}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">, address: TypedAbiArg<string | null, "address">], Response<{
  "assetConfig": {
  "isStablecoin": boolean;
  "maxSlippage": bigint;
  "priceFeedId": Uint8Array;
  "tokenBase": bigint;
} | null;
  "isAdd": boolean;
  "ts": bigint;
  "value": bigint | null;
}, bigint>>,
    getUpdateRequestVar: {"name":"get-update-request-var","access":"read_only","args":[{"name":"type","type":{"buffer":{"length":1}}}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"asset-config","type":{"optional":{"tuple":[{"name":"is-stablecoin","type":"bool"},{"name":"max-slippage","type":"uint128"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"token-base","type":"uint128"}]}}},{"name":"is-add","type":"bool"},{"name":"ts","type":"uint128"},{"name":"value","type":{"optional":"uint128"}}]},"error":"uint128"}}}} as TypedAbiFunction<[type: TypedAbiArg<Uint8Array, "type">], Response<{
  "assetConfig": {
  "isStablecoin": boolean;
  "maxSlippage": bigint;
  "priceFeedId": Uint8Array;
  "tokenBase": bigint;
} | null;
  "isAdd": boolean;
  "ts": bigint;
  "value": bigint | null;
}, bigint>>,
    getUpdateWindow: {"name":"get-update-window","access":"read_only","args":[],"outputs":{"type":"uint128"}} as TypedAbiFunction<[], bigint>,
    getVaultEnabled: {"name":"get-vault-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>
  },
  "maps": {
    assets: {"name":"assets","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"active","type":"bool"},{"name":"is-stablecoin","type":"bool"},{"name":"max-slippage","type":"uint128"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"token-base","type":"uint128"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "active": boolean;
  "isStablecoin": boolean;
  "maxSlippage": bigint;
  "priceFeedId": Uint8Array;
  "tokenBase": bigint;
}>,
    customCooldown: {"name":"custom-cooldown","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"cooldown","type":"uint128"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "cooldown": bigint;
}>,
    customExitFee: {"name":"custom-exit-fee","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"exit-fee","type":"uint128"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "exitFee": bigint;
}>,
    externals: {"name":"externals","key":{"tuple":[{"name":"address","type":"principal"}]},"value":{"tuple":[{"name":"active","type":"bool"}]}} as TypedAbiMap<{
  "address": string;
}, {
  "active": boolean;
}>,
    updateRequests: {"name":"update-requests","key":{"tuple":[{"name":"address","type":{"optional":"principal"}},{"name":"type","type":{"buffer":{"length":1}}}]},"value":{"tuple":[{"name":"asset-config","type":{"optional":{"tuple":[{"name":"is-stablecoin","type":"bool"},{"name":"max-slippage","type":"uint128"},{"name":"price-feed-id","type":{"buffer":{"length":32}}},{"name":"token-base","type":"uint128"}]}}},{"name":"is-add","type":"bool"},{"name":"ts","type":"uint128"},{"name":"value","type":{"optional":"uint128"}}]}} as TypedAbiMap<{
  "address": string | null;
  "type": Uint8Array;
}, {
  "assetConfig": {
  "isStablecoin": boolean;
  "maxSlippage": bigint;
  "priceFeedId": Uint8Array;
  "tokenBase": bigint;
} | null;
  "isAdd": boolean;
  "ts": bigint;
  "value": bigint | null;
}>
  },
  "variables": {
    ASSET: {
  name: 'ASSET',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    COOLDOWN: {
  name: 'COOLDOWN',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    ERR_ABOVE_MAX: {
  name: 'ERR_ABOVE_MAX',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_BELOW_MIN: {
  name: 'ERR_BELOW_MIN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_DEPOSIT_DISABLED: {
  name: 'ERR_DEPOSIT_DISABLED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_DEVIATION: {
  name: 'ERR_DEVIATION',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_DUPLICATE: {
  name: 'ERR_DUPLICATE',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_EXPRESS_DISABLED: {
  name: 'ERR_EXPRESS_DISABLED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_FEE_WINDOW: {
  name: 'ERR_FEE_WINDOW',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID: {
  name: 'ERR_INVALID',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_DECIMALS: {
  name: 'ERR_INVALID_DECIMALS',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_TYPE: {
  name: 'ERR_INVALID_TYPE',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_LIMIT_EXCEEDED: {
  name: 'ERR_LIMIT_EXCEEDED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_ASSET: {
  name: 'ERR_NOT_ASSET',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_EXTERNAL: {
  name: 'ERR_NOT_EXTERNAL',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_ENTRY: {
  name: 'ERR_NO_ENTRY',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_OPERATIONS: {
  name: 'ERR_NO_OPERATIONS',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_REDEEM_DISABLED: {
  name: 'ERR_REDEEM_DISABLED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_REWARD_DISABLED: {
  name: 'ERR_REWARD_DISABLED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_TRADING_DISABLED: {
  name: 'ERR_TRADING_DISABLED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_TRANSFER_DISABLED: {
  name: 'ERR_TRANSFER_DISABLED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_VAULT_DISABLED: {
  name: 'ERR_VAULT_DISABLED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_WINDOW_CLOSED: {
  name: 'ERR_WINDOW_CLOSED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_ZERO_SUPPLY: {
  name: 'ERR_ZERO_SUPPLY',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    EXPRESS_COOLDOWN: {
  name: 'EXPRESS_COOLDOWN',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    EXPRESS_LIMIT: {
  name: 'EXPRESS_LIMIT',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    EXPRESS_WINDOW: {
  name: 'EXPRESS_WINDOW',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    EXTERNAL: {
  name: 'EXTERNAL',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    MAX_DEVIATION: {
  name: 'MAX_DEVIATION',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    MAX_REWARD: {
  name: 'MAX_REWARD',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    MAX_SLIPPAGE: {
  name: 'MAX_SLIPPAGE',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    MIN_REDEEM: {
  name: 'MIN_REDEEM',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    UPDATE_WINDOW: {
  name: 'UPDATE_WINDOW',
  type: {
    buffer: {
      length: 1
    }
  },
  access: 'constant'
} as TypedAbiVariable<Uint8Array>,
    bpsBase: {
  name: 'bps-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    max: {
  name: 'max',
  type: {
    tuple: [
      {
        name: 'cooldown',
        type: 'uint128'
      },
      {
        name: 'exit-fee',
        type: 'uint128'
      },
      {
        name: 'express-fee',
        type: 'uint128'
      },
      {
        name: 'mgmt-fee',
        type: 'uint128'
      },
      {
        name: 'perf-fee',
        type: 'uint128'
      },
      {
        name: 'reserve-rate',
        type: 'uint128'
      }
    ]
  },
  access: 'constant'
} as TypedAbiVariable<{
  "cooldown": bigint;
  "exitFee": bigint;
  "expressFee": bigint;
  "mgmtFee": bigint;
  "perfFee": bigint;
  "reserveRate": bigint;
}>,
    oneHour: {
  name: 'one-hour',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    shareBase: {
  name: 'share-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    claimId: {
  name: 'claim-id',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    cooldown: {
  name: 'cooldown',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    currentExpressLimit: {
  name: 'current-express-limit',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    depositCap: {
  name: 'deposit-cap',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    depositEnabled: {
  name: 'deposit-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    expressCooldown: {
  name: 'express-cooldown',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    expressEnabled: {
  name: 'express-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    expressLimit: {
  name: 'express-limit',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    expressLimitEnabled: {
  name: 'express-limit-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    expressWindow: {
  name: 'express-window',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    feeAddress: {
  name: 'fee-address',
  type: 'principal',
  access: 'variable'
} as TypedAbiVariable<string>,
    fees: {
  name: 'fees',
  type: {
    tuple: [
      {
        name: 'exit-fee',
        type: 'uint128'
      },
      {
        name: 'express-fee',
        type: 'uint128'
      },
      {
        name: 'mgmt-fee',
        type: 'uint128'
      },
      {
        name: 'perf-fee',
        type: 'uint128'
      }
    ]
  },
  access: 'variable'
} as TypedAbiVariable<{
  "exitFee": bigint;
  "expressFee": bigint;
  "mgmtFee": bigint;
  "perfFee": bigint;
}>,
    lastExpressTs: {
  name: 'last-express-ts',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    lastLogTs: {
  name: 'last-log-ts',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    maxDeviation: {
  name: 'max-deviation',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    maxReward: {
  name: 'max-reward',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    maxSlippage: {
  name: 'max-slippage',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    minDeposit: {
  name: 'min-deposit',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    minRedeem: {
  name: 'min-redeem',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    pendingFees: {
  name: 'pending-fees',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    pendingRf: {
  name: 'pending-rf',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    redeemEnabled: {
  name: 'redeem-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    reserveRate: {
  name: 'reserve-rate',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    rewardEnabled: {
  name: 'reward-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    stalenessWindow: {
  name: 'staleness-window',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    totalAssets: {
  name: 'total-assets',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    tradingEnabled: {
  name: 'trading-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    transferEnabled: {
  name: 'transfer-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    updateWindow: {
  name: 'update-window',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    vaultEnabled: {
  name: 'vault-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>
  },
  constants: {
  ASSET: Uint8Array.from([160]),
  COOLDOWN: Uint8Array.from([5]),
  ERR_ABOVE_MAX: {
    isOk: false,
    value: 102_008n
  },
  ERR_BELOW_MIN: {
    isOk: false,
    value: 102_009n
  },
  ERR_DEPOSIT_DISABLED: {
    isOk: false,
    value: 102_005n
  },
  ERR_DEVIATION: {
    isOk: false,
    value: 102_013n
  },
  ERR_DUPLICATE: {
    isOk: false,
    value: 102_012n
  },
  ERR_EXPRESS_DISABLED: {
    isOk: false,
    value: 102_017n
  },
  ERR_FEE_WINDOW: {
    isOk: false,
    value: 102_018n
  },
  ERR_INVALID: {
    isOk: false,
    value: 102_014n
  },
  ERR_INVALID_DECIMALS: {
    isOk: false,
    value: 102_022n
  },
  ERR_INVALID_TYPE: {
    isOk: false,
    value: 102_019n
  },
  ERR_LIMIT_EXCEEDED: {
    isOk: false,
    value: 102_020n
  },
  ERR_NOT_ASSET: {
    isOk: false,
    value: 102_001n
  },
  ERR_NOT_EXTERNAL: {
    isOk: false,
    value: 102_002n
  },
  ERR_NO_ENTRY: {
    isOk: false,
    value: 102_011n
  },
  ERR_NO_OPERATIONS: {
    isOk: false,
    value: 102_015n
  },
  ERR_REDEEM_DISABLED: {
    isOk: false,
    value: 102_006n
  },
  ERR_REWARD_DISABLED: {
    isOk: false,
    value: 102_021n
  },
  ERR_TRADING_DISABLED: {
    isOk: false,
    value: 102_007n
  },
  ERR_TRANSFER_DISABLED: {
    isOk: false,
    value: 102_003n
  },
  ERR_VAULT_DISABLED: {
    isOk: false,
    value: 102_004n
  },
  ERR_WINDOW_CLOSED: {
    isOk: false,
    value: 102_010n
  },
  ERR_ZERO_SUPPLY: {
    isOk: false,
    value: 102_016n
  },
  EXPRESS_COOLDOWN: Uint8Array.from([6]),
  EXPRESS_LIMIT: Uint8Array.from([7]),
  EXPRESS_WINDOW: Uint8Array.from([8]),
  EXTERNAL: Uint8Array.from([161]),
  MAX_DEVIATION: Uint8Array.from([2]),
  MAX_REWARD: Uint8Array.from([1]),
  MAX_SLIPPAGE: Uint8Array.from([3]),
  MIN_REDEEM: Uint8Array.from([4]),
  UPDATE_WINDOW: Uint8Array.from([9]),
  bpsBase: 10_000n,
  claimId: 0n,
  cooldown: 0n,
  currentExpressLimit: 0n,
  depositCap: 100_000_000_000n,
  depositEnabled: true,
  expressCooldown: 0n,
  expressEnabled: true,
  expressLimit: 250n,
  expressLimitEnabled: false,
  expressWindow: 86_400n,
  feeAddress: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R',
  fees: {
    exitFee: 0n,
    expressFee: 50n,
    mgmtFee: 0n,
    perfFee: 1_000n
  },
  lastExpressTs: 0n,
  lastLogTs: 0n,
  max: {
    cooldown: 2_592_000n,
    exitFee: 100n,
    expressFee: 200n,
    mgmtFee: 55n,
    perfFee: 2_000n,
    reserveRate: 5_000n
  },
  maxDeviation: 5n,
  maxReward: 3n,
  maxSlippage: 500n,
  minDeposit: 100n,
  minRedeem: 100n,
  oneHour: 3_600n,
  pendingFees: 0n,
  pendingRf: 0n,
  redeemEnabled: true,
  reserveRate: 500n,
  rewardEnabled: true,
  shareBase: 100_000_000n,
  stalenessWindow: 50n,
  totalAssets: 0n,
  tradingEnabled: true,
  transferEnabled: true,
  updateWindow: 999_999_999n,
  vaultEnabled: true
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'state',
  },
susdhToken: {
  "functions": {
    burnForProtocol: {"name":"burn-for-protocol","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">], Response<boolean, bigint>>,
    disableBlacklist: {"name":"disable-blacklist","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    enableBlacklist: {"name":"enable-blacklist","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    migrateBalance: {"name":"migrate-balance","access":"public","args":[{"name":"who","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[who: TypedAbiArg<string, "who">], Response<bigint, bigint>>,
    mintForProtocol: {"name":"mint-for-protocol","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    setOnlyProtocol: {"name":"set-only-protocol","access":"public","args":[{"name":"value","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[value: TypedAbiArg<boolean, "value">], Response<boolean, bigint>>,
    setTokenName: {"name":"set-token-name","access":"public","args":[{"name":"name","type":{"string-ascii":{"length":32}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[name: TypedAbiArg<string, "name">], Response<boolean, bigint>>,
    setTokenUri: {"name":"set-token-uri","access":"public","args":[{"name":"value","type":{"string-utf8":{"length":256}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[value: TypedAbiArg<string, "value">], Response<boolean, bigint>>,
    startMigration: {"name":"start-migration","access":"public","args":[{"name":"manager","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[manager: TypedAbiArg<string, "manager">], Response<boolean, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">, memo: TypedAbiArg<Uint8Array | null, "memo">], Response<boolean, bigint>>,
    getBalance: {"name":"get-balance","access":"read_only","args":[{"name":"account","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[account: TypedAbiArg<string, "account">], Response<bigint, null>>,
    getBlacklistEnabled: {"name":"get-blacklist-enabled","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getDecimals: {"name":"get-decimals","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getName: {"name":"get-name","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":32}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getOnlyProtocol: {"name":"get-only-protocol","access":"read_only","args":[],"outputs":{"type":"bool"}} as TypedAbiFunction<[], boolean>,
    getSymbol: {"name":"get-symbol","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":5}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"optional":{"string-utf8":{"length":256}}},"error":"none"}}}} as TypedAbiFunction<[], Response<string | null, null>>,
    getTotalSupply: {"name":"get-total-supply","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    isNotMigrated: {"name":"is-not-migrated","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_DEPRECATED_TOKEN: {
  name: 'ERR_DEPRECATED_TOKEN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_AUTHORIZED: {
  name: 'ERR_NOT_AUTHORIZED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_MIGRATION_MANAGER: {
  name: 'ERR_NOT_MIGRATION_MANAGER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_ONLY_PROTOCOL: {
  name: 'ERR_ONLY_PROTOCOL',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    blacklistEnabled: {
  name: 'blacklist-enabled',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    counter: {
  name: 'counter',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    migrationManager: {
  name: 'migration-manager',
  type: {
    optional: 'principal'
  },
  access: 'variable'
} as TypedAbiVariable<string | null>,
    migrationStartHeight: {
  name: 'migration-start-height',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    onlyProtocol: {
  name: 'only-protocol',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    tokenName: {
  name: 'token-name',
  type: {
    'string-ascii': {
      length: 32
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    tokenUri: {
  name: 'token-uri',
  type: {
    'string-utf8': {
      length: 256
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>
  },
  constants: {
  ERR_DEPRECATED_TOKEN: {
    isOk: false,
    value: 1_503n
  },
  ERR_NOT_AUTHORIZED: {
    isOk: false,
    value: 1_501n
  },
  ERR_NOT_MIGRATION_MANAGER: {
    isOk: false,
    value: 1_504n
  },
  ERR_ONLY_PROTOCOL: {
    isOk: false,
    value: 1_502n
  },
  blacklistEnabled: false,
  counter: 0n,
  migrationManager: null,
  migrationStartHeight: 0n,
  onlyProtocol: false,
  tokenName: 'Hermetica Staked USDh',
  tokenUri: ''
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[{"name":"susdh"}],"epoch":"Epoch25","clarity_version":"Clarity2",
  contractName: 'susdh-token',
  },
tokenMigrationTrait: {
  "functions": {
    
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch25","clarity_version":"Clarity2",
  contractName: 'token-migration-trait',
  },
trading: {
  "functions": {
    zestAddOpen: {"name":"zest-add-open","access":"public","args":[{"name":"market","type":"trait_reference"},{"name":"staking","type":"trait_reference"},{"name":"collateral-token","type":"trait_reference"},{"name":"borrow-token","type":"trait_reference"},{"name":"collateral-amount","type":"uint128"},{"name":"borrow-amount","type":"uint128"},{"name":"price-feed-1","type":{"optional":{"buffer":{"length":8192}}}},{"name":"price-feed-2","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[market: TypedAbiArg<string, "market">, staking: TypedAbiArg<string, "staking">, collateralToken: TypedAbiArg<string, "collateralToken">, borrowToken: TypedAbiArg<string, "borrowToken">, collateralAmount: TypedAbiArg<number | bigint, "collateralAmount">, borrowAmount: TypedAbiArg<number | bigint, "borrowAmount">, priceFeed1: TypedAbiArg<Uint8Array | null, "priceFeed1">, priceFeed2: TypedAbiArg<Uint8Array | null, "priceFeed2">], Response<boolean, bigint>>,
    zestClose: {"name":"zest-close","access":"public","args":[{"name":"market","type":"trait_reference"},{"name":"staking","type":"trait_reference"},{"name":"staking-silo","type":"trait_reference"},{"name":"repay-token","type":"trait_reference"},{"name":"unstake-amount","type":"uint128"},{"name":"price-feed-1","type":{"optional":{"buffer":{"length":8192}}}},{"name":"price-feed-2","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[market: TypedAbiArg<string, "market">, staking: TypedAbiArg<string, "staking">, stakingSilo: TypedAbiArg<string, "stakingSilo">, repayToken: TypedAbiArg<string, "repayToken">, unstakeAmount: TypedAbiArg<number | bigint, "unstakeAmount">, priceFeed1: TypedAbiArg<Uint8Array | null, "priceFeed1">, priceFeed2: TypedAbiArg<Uint8Array | null, "priceFeed2">], Response<boolean, bigint>>,
    zestCloseRemove: {"name":"zest-close-remove","access":"public","args":[{"name":"market","type":"trait_reference"},{"name":"staking","type":"trait_reference"},{"name":"staking-silo","type":"trait_reference"},{"name":"hbtc-vault","type":"trait_reference"},{"name":"collateral-token","type":"trait_reference"},{"name":"repay-token","type":"trait_reference"},{"name":"unstake-amount","type":"uint128"},{"name":"collateral-amount","type":"uint128"},{"name":"claim-ids","type":{"list":{"type":"uint128","length":1000}}},{"name":"price-feed-1","type":{"optional":{"buffer":{"length":8192}}}},{"name":"price-feed-2","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[market: TypedAbiArg<string, "market">, staking: TypedAbiArg<string, "staking">, stakingSilo: TypedAbiArg<string, "stakingSilo">, hbtcVault: TypedAbiArg<string, "hbtcVault">, collateralToken: TypedAbiArg<string, "collateralToken">, repayToken: TypedAbiArg<string, "repayToken">, unstakeAmount: TypedAbiArg<number | bigint, "unstakeAmount">, collateralAmount: TypedAbiArg<number | bigint, "collateralAmount">, claimIds: TypedAbiArg<number | bigint[], "claimIds">, priceFeed1: TypedAbiArg<Uint8Array | null, "priceFeed1">, priceFeed2: TypedAbiArg<Uint8Array | null, "priceFeed2">], Response<boolean, bigint>>,
    zestCloseRemoveRedeem: {"name":"zest-close-remove-redeem","access":"public","args":[{"name":"market","type":"trait_reference"},{"name":"vault","type":"trait_reference"},{"name":"staking","type":"trait_reference"},{"name":"staking-silo","type":"trait_reference"},{"name":"hbtc-vault","type":"trait_reference"},{"name":"repay-token","type":"trait_reference"},{"name":"unstake-amount","type":"uint128"},{"name":"collateral-amount","type":"uint128"},{"name":"min-collateral-amount","type":"uint128"},{"name":"claim-ids","type":{"list":{"type":"uint128","length":1000}}},{"name":"price-feed-1","type":{"optional":{"buffer":{"length":8192}}}},{"name":"price-feed-2","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[market: TypedAbiArg<string, "market">, vault: TypedAbiArg<string, "vault">, staking: TypedAbiArg<string, "staking">, stakingSilo: TypedAbiArg<string, "stakingSilo">, hbtcVault: TypedAbiArg<string, "hbtcVault">, repayToken: TypedAbiArg<string, "repayToken">, unstakeAmount: TypedAbiArg<number | bigint, "unstakeAmount">, collateralAmount: TypedAbiArg<number | bigint, "collateralAmount">, minCollateralAmount: TypedAbiArg<number | bigint, "minCollateralAmount">, claimIds: TypedAbiArg<number | bigint[], "claimIds">, priceFeed1: TypedAbiArg<Uint8Array | null, "priceFeed1">, priceFeed2: TypedAbiArg<Uint8Array | null, "priceFeed2">], Response<boolean, bigint>>,
    zestDepositAddOpen: {"name":"zest-deposit-add-open","access":"public","args":[{"name":"market","type":"trait_reference"},{"name":"vault","type":"trait_reference"},{"name":"staking","type":"trait_reference"},{"name":"collateral-token","type":"trait_reference"},{"name":"borrow-token","type":"trait_reference"},{"name":"collateral-amount","type":"uint128"},{"name":"borrow-amount","type":"uint128"},{"name":"min-shares","type":"uint128"},{"name":"price-feed-1","type":{"optional":{"buffer":{"length":8192}}}},{"name":"price-feed-2","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[market: TypedAbiArg<string, "market">, vault: TypedAbiArg<string, "vault">, staking: TypedAbiArg<string, "staking">, collateralToken: TypedAbiArg<string, "collateralToken">, borrowToken: TypedAbiArg<string, "borrowToken">, collateralAmount: TypedAbiArg<number | bigint, "collateralAmount">, borrowAmount: TypedAbiArg<number | bigint, "borrowAmount">, minShares: TypedAbiArg<number | bigint, "minShares">, priceFeed1: TypedAbiArg<Uint8Array | null, "priceFeed1">, priceFeed2: TypedAbiArg<Uint8Array | null, "priceFeed2">], Response<boolean, bigint>>,
    zestOpen: {"name":"zest-open","access":"public","args":[{"name":"market","type":"trait_reference"},{"name":"staking","type":"trait_reference"},{"name":"borrow-token","type":"trait_reference"},{"name":"borrow-amount","type":"uint128"},{"name":"price-feed-1","type":{"optional":{"buffer":{"length":8192}}}},{"name":"price-feed-2","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[market: TypedAbiArg<string, "market">, staking: TypedAbiArg<string, "staking">, borrowToken: TypedAbiArg<string, "borrowToken">, borrowAmount: TypedAbiArg<number | bigint, "borrowAmount">, priceFeed1: TypedAbiArg<Uint8Array | null, "priceFeed1">, priceFeed2: TypedAbiArg<Uint8Array | null, "priceFeed2">], Response<boolean, bigint>>,
    zestSweepAndReward: {"name":"zest-sweep-and-reward","access":"public","args":[{"name":"asset","type":"trait_reference"},{"name":"sweep-amount","type":"uint128"},{"name":"reward","type":"uint128"},{"name":"is-positive","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[asset: TypedAbiArg<string, "asset">, sweepAmount: TypedAbiArg<number | bigint, "sweepAmount">, reward: TypedAbiArg<number | bigint, "reward">, isPositive: TypedAbiArg<boolean, "isPositive">], Response<boolean, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_INVALID_AMOUNT: {
  name: 'ERR_INVALID_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_TOKEN: {
  name: 'ERR_INVALID_TOKEN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    usdhToken: {
  name: 'usdh-token',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>
  },
  constants: {
  ERR_INVALID_AMOUNT: {
    isOk: false,
    value: 120_001n
  },
  ERR_INVALID_TOKEN: {
    isOk: false,
    value: 120_002n
  },
  usdhToken: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.usdh-token'
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'trading',
  },
usdhToken: {
  "functions": {
    burn: {"name":"burn","access":"public","args":[{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">], Response<boolean, bigint>>,
    burnForProtocol: {"name":"burn-for-protocol","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">], Response<boolean, bigint>>,
    migrateBalance: {"name":"migrate-balance","access":"public","args":[{"name":"who","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[who: TypedAbiArg<string, "who">], Response<bigint, bigint>>,
    mintForProtocol: {"name":"mint-for-protocol","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    setTokenName: {"name":"set-token-name","access":"public","args":[{"name":"name","type":{"string-ascii":{"length":32}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[name: TypedAbiArg<string, "name">], Response<boolean, bigint>>,
    setTokenUri: {"name":"set-token-uri","access":"public","args":[{"name":"value","type":{"string-utf8":{"length":256}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[value: TypedAbiArg<string, "value">], Response<boolean, bigint>>,
    startMigration: {"name":"start-migration","access":"public","args":[{"name":"manager","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[manager: TypedAbiArg<string, "manager">], Response<boolean, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">, memo: TypedAbiArg<Uint8Array | null, "memo">], Response<boolean, bigint>>,
    getBalance: {"name":"get-balance","access":"read_only","args":[{"name":"account","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[account: TypedAbiArg<string, "account">], Response<bigint, null>>,
    getDecimals: {"name":"get-decimals","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getName: {"name":"get-name","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":32}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getSymbol: {"name":"get-symbol","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":4}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"optional":{"string-utf8":{"length":256}}},"error":"none"}}}} as TypedAbiFunction<[], Response<string | null, null>>,
    getTotalSupply: {"name":"get-total-supply","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    isNotMigrated: {"name":"is-not-migrated","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_DEPRECATED_TOKEN: {
  name: 'ERR_DEPRECATED_TOKEN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_AUTHORIZED: {
  name: 'ERR_NOT_AUTHORIZED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_MIGRATION_MANAGER: {
  name: 'ERR_NOT_MIGRATION_MANAGER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    migrationManager: {
  name: 'migration-manager',
  type: {
    optional: 'principal'
  },
  access: 'variable'
} as TypedAbiVariable<string | null>,
    migrationStartHeight: {
  name: 'migration-start-height',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    tokenName: {
  name: 'token-name',
  type: {
    'string-ascii': {
      length: 32
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    tokenUri: {
  name: 'token-uri',
  type: {
    'string-utf8': {
      length: 256
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>
  },
  constants: {
  ERR_DEPRECATED_TOKEN: {
    isOk: false,
    value: 1_402n
  },
  ERR_NOT_AUTHORIZED: {
    isOk: false,
    value: 1_401n
  },
  ERR_NOT_MIGRATION_MANAGER: {
    isOk: false,
    value: 1_403n
  },
  migrationManager: null,
  migrationStartHeight: 0n,
  tokenName: 'Hermetica USDh',
  tokenUri: ''
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[{"name":"usdh"}],"epoch":"Epoch25","clarity_version":"Clarity2",
  contractName: 'usdh-token',
  },
vault: {
  "functions": {
    createClaim: {"name":"create-claim","access":"private","args":[{"name":"shares","type":"uint128"},{"name":"exit-fee","type":"uint128"},{"name":"cooldown","type":"uint128"},{"name":"is-express","type":"bool"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[shares: TypedAbiArg<number | bigint, "shares">, exitFee: TypedAbiArg<number | bigint, "exitFee">, cooldown: TypedAbiArg<number | bigint, "cooldown">, isExpress: TypedAbiArg<boolean, "isExpress">], Response<bigint, bigint>>,
    fundClaimIter: {"name":"fund-claim-iter","access":"private","args":[{"name":"claim-id","type":"uint128"},{"name":"prev","type":{"response":{"ok":{"tuple":[{"name":"share-price","type":"uint128"},{"name":"total-assets","type":"uint128"},{"name":"total-shares","type":"uint128"}]},"error":"uint128"}}}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"share-price","type":"uint128"},{"name":"total-assets","type":"uint128"},{"name":"total-shares","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[claimId: TypedAbiArg<number | bigint, "claimId">, prev: TypedAbiArg<Response<{
  "sharePrice": number | bigint;
  "totalAssets": number | bigint;
  "totalShares": number | bigint;
}, number | bigint>, "prev">], Response<{
  "sharePrice": bigint;
  "totalAssets": bigint;
  "totalShares": bigint;
}, bigint>>,
    processClaim: {"name":"process-claim","access":"private","args":[{"name":"claim-id","type":"uint128"},{"name":"claim","type":{"tuple":[{"name":"assets","type":{"optional":"uint128"}},{"name":"fee","type":{"optional":"uint128"}},{"name":"fee-bps","type":"uint128"},{"name":"is-express","type":"bool"},{"name":"share-price","type":{"optional":"uint128"}},{"name":"shares","type":"uint128"},{"name":"ts","type":"uint128"},{"name":"user","type":"principal"}]}},{"name":"share-price","type":"uint128"},{"name":"maybe-manager","type":{"optional":"bool"}}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"assets","type":"uint128"},{"name":"shares","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[claimId: TypedAbiArg<number | bigint, "claimId">, claim: TypedAbiArg<{
  "assets": number | bigint | null;
  "fee": number | bigint | null;
  "feeBps": number | bigint;
  "isExpress": boolean;
  "sharePrice": number | bigint | null;
  "shares": number | bigint;
  "ts": number | bigint;
  "user": string;
}, "claim">, sharePrice: TypedAbiArg<number | bigint, "sharePrice">, maybeManager: TypedAbiArg<boolean | null, "maybeManager">], Response<{
  "assets": bigint;
  "shares": bigint;
}, bigint>>,
    redeemInternal: {"name":"redeem-internal","access":"private","args":[{"name":"claim-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[claimId: TypedAbiArg<number | bigint, "claimId">], Response<bigint, bigint>>,
    cancelRedeem: {"name":"cancel-redeem","access":"public","args":[{"name":"claim-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[claimId: TypedAbiArg<number | bigint, "claimId">], Response<bigint, bigint>>,
    deposit: {"name":"deposit","access":"public","args":[{"name":"assets","type":"uint128"},{"name":"affiliate","type":{"optional":{"buffer":{"length":64}}}}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[assets: TypedAbiArg<number | bigint, "assets">, affiliate: TypedAbiArg<Uint8Array | null, "affiliate">], Response<bigint, bigint>>,
    fundClaim: {"name":"fund-claim","access":"public","args":[{"name":"claim-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[claimId: TypedAbiArg<number | bigint, "claimId">], Response<bigint, bigint>>,
    fundClaimMany: {"name":"fund-claim-many","access":"public","args":[{"name":"claim-ids","type":{"list":{"type":"uint128","length":1000}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[claimIds: TypedAbiArg<number | bigint[], "claimIds">], Response<boolean, bigint>>,
    redeem: {"name":"redeem","access":"public","args":[{"name":"claim-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[claimId: TypedAbiArg<number | bigint, "claimId">], Response<bigint, bigint>>,
    redeemMany: {"name":"redeem-many","access":"public","args":[{"name":"entries","type":{"list":{"type":"uint128","length":1000}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"uint128","error":"uint128"}},"length":1000}},"error":"uint128"}}}} as TypedAbiFunction<[entries: TypedAbiArg<number | bigint[], "entries">], Response<Response<bigint, bigint>[], bigint>>,
    redeemPegOut: {"name":"redeem-peg-out","access":"public","args":[{"name":"claim-id","type":"uint128"},{"name":"btc-recipient","type":{"tuple":[{"name":"hashbytes","type":{"buffer":{"length":32}}},{"name":"version","type":{"buffer":{"length":1}}}]}},{"name":"max-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[claimId: TypedAbiArg<number | bigint, "claimId">, btcRecipient: TypedAbiArg<{
  "hashbytes": Uint8Array;
  "version": Uint8Array;
}, "btcRecipient">, maxFee: TypedAbiArg<number | bigint, "maxFee">], Response<bigint, bigint>>,
    requestRedeem: {"name":"request-redeem","access":"public","args":[{"name":"shares","type":"uint128"},{"name":"is-express","type":"bool"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[shares: TypedAbiArg<number | bigint, "shares">, isExpress: TypedAbiArg<boolean, "isExpress">], Response<bigint, bigint>>,
    getClaim: {"name":"get-claim","access":"read_only","args":[{"name":"id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"assets","type":{"optional":"uint128"}},{"name":"fee","type":{"optional":"uint128"}},{"name":"fee-bps","type":"uint128"},{"name":"is-express","type":"bool"},{"name":"share-price","type":{"optional":"uint128"}},{"name":"shares","type":"uint128"},{"name":"ts","type":"uint128"},{"name":"user","type":"principal"}]},"error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], Response<{
  "assets": bigint | null;
  "fee": bigint | null;
  "feeBps": bigint;
  "isExpress": boolean;
  "sharePrice": bigint | null;
  "shares": bigint;
  "ts": bigint;
  "user": string;
}, bigint>>,
    previewDeposit: {"name":"preview-deposit","access":"read_only","args":[{"name":"assets","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[assets: TypedAbiArg<number | bigint, "assets">], bigint>,
    previewRedeem: {"name":"preview-redeem","access":"read_only","args":[{"name":"shares","type":"uint128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[shares: TypedAbiArg<number | bigint, "shares">], bigint>
  },
  "maps": {
    claims: {"name":"claims","key":{"tuple":[{"name":"claim-id","type":"uint128"}]},"value":{"tuple":[{"name":"assets","type":{"optional":"uint128"}},{"name":"fee","type":{"optional":"uint128"}},{"name":"fee-bps","type":"uint128"},{"name":"is-express","type":"bool"},{"name":"share-price","type":{"optional":"uint128"}},{"name":"shares","type":"uint128"},{"name":"ts","type":"uint128"},{"name":"user","type":"principal"}]}} as TypedAbiMap<{
  "claimId": number | bigint;
}, {
  "assets": bigint | null;
  "fee": bigint | null;
  "feeBps": bigint;
  "isExpress": boolean;
  "sharePrice": bigint | null;
  "shares": bigint;
  "ts": bigint;
  "user": string;
}>
  },
  "variables": {
    ERR_ALREADY_FUNDED: {
  name: 'ERR_ALREADY_FUNDED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_BELOW_MIN: {
  name: 'ERR_BELOW_MIN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_DEPOSIT_CAP_EXCEEDED: {
  name: 'ERR_DEPOSIT_CAP_EXCEEDED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_EMPTY_LIST: {
  name: 'ERR_EMPTY_LIST',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_ALLOWED: {
  name: 'ERR_NOT_ALLOWED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_AUTHORIZED: {
  name: 'ERR_NOT_AUTHORIZED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_COOLED_DOWN: {
  name: 'ERR_NOT_COOLED_DOWN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_FUNDED: {
  name: 'ERR_NOT_FUNDED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_CLAIM_FOR_ID: {
  name: 'ERR_NO_CLAIM_FOR_ID',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_SENDER_NOT_CALLER: {
  name: 'ERR_SENDER_NOT_CALLER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    bpsBase: {
  name: 'bps-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    feeCollector: {
  name: 'fee-collector',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    reserve: {
  name: 'reserve',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    sbtcToken: {
  name: 'sbtc-token',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    shareBase: {
  name: 'share-base',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>
  },
  constants: {
  ERR_ALREADY_FUNDED: {
    isOk: false,
    value: 103_005n
  },
  ERR_BELOW_MIN: {
    isOk: false,
    value: 103_002n
  },
  ERR_DEPOSIT_CAP_EXCEEDED: {
    isOk: false,
    value: 103_001n
  },
  ERR_EMPTY_LIST: {
    isOk: false,
    value: 103_007n
  },
  ERR_NOT_ALLOWED: {
    isOk: false,
    value: 103_009n
  },
  ERR_NOT_AUTHORIZED: {
    isOk: false,
    value: 103_008n
  },
  ERR_NOT_COOLED_DOWN: {
    isOk: false,
    value: 103_004n
  },
  ERR_NOT_FUNDED: {
    isOk: false,
    value: 103_006n
  },
  ERR_NO_CLAIM_FOR_ID: {
    isOk: false,
    value: 103_003n
  },
  ERR_SENDER_NOT_CALLER: {
    isOk: false,
    value: 103_010n
  },
  bpsBase: 10_000n,
  feeCollector: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.fee-collector',
  reserve: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.reserve',
  sbtcToken: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
  shareBase: 100_000_000n
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'vault',
  },
vaultTraitV1: {
  "functions": {
    
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'vault-trait-v1',
  },
zestInterface: {
  "functions": {
    writeFeed: {"name":"write-feed","access":"private","args":[{"name":"price-feed","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[priceFeed: TypedAbiArg<Uint8Array | null, "priceFeed">], Response<boolean, bigint>>,
    sweep: {"name":"sweep","access":"public","args":[{"name":"asset","type":"trait_reference"},{"name":"amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[asset: TypedAbiArg<string, "asset">, amount: TypedAbiArg<number | bigint, "amount">], Response<bigint, bigint>>,
    zestBorrow: {"name":"zest-borrow","access":"public","args":[{"name":"market","type":"trait_reference"},{"name":"asset","type":"trait_reference"},{"name":"amount","type":"uint128"},{"name":"price-feed-1","type":{"optional":{"buffer":{"length":8192}}}},{"name":"price-feed-2","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[market: TypedAbiArg<string, "market">, asset: TypedAbiArg<string, "asset">, amount: TypedAbiArg<number | bigint, "amount">, priceFeed1: TypedAbiArg<Uint8Array | null, "priceFeed1">, priceFeed2: TypedAbiArg<Uint8Array | null, "priceFeed2">], Response<boolean, bigint>>,
    zestCollateralAdd: {"name":"zest-collateral-add","access":"public","args":[{"name":"market","type":"trait_reference"},{"name":"asset","type":"trait_reference"},{"name":"amount","type":"uint128"},{"name":"price-feed-1","type":{"optional":{"buffer":{"length":8192}}}},{"name":"price-feed-2","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[market: TypedAbiArg<string, "market">, asset: TypedAbiArg<string, "asset">, amount: TypedAbiArg<number | bigint, "amount">, priceFeed1: TypedAbiArg<Uint8Array | null, "priceFeed1">, priceFeed2: TypedAbiArg<Uint8Array | null, "priceFeed2">], Response<bigint, bigint>>,
    zestCollateralRemove: {"name":"zest-collateral-remove","access":"public","args":[{"name":"market","type":"trait_reference"},{"name":"asset","type":"trait_reference"},{"name":"amount","type":"uint128"},{"name":"price-feed-1","type":{"optional":{"buffer":{"length":8192}}}},{"name":"price-feed-2","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[market: TypedAbiArg<string, "market">, asset: TypedAbiArg<string, "asset">, amount: TypedAbiArg<number | bigint, "amount">, priceFeed1: TypedAbiArg<Uint8Array | null, "priceFeed1">, priceFeed2: TypedAbiArg<Uint8Array | null, "priceFeed2">], Response<bigint, bigint>>,
    zestCollateralRemoveRedeem: {"name":"zest-collateral-remove-redeem","access":"public","args":[{"name":"market","type":"trait_reference"},{"name":"vault","type":"trait_reference"},{"name":"amount","type":"uint128"},{"name":"min-underlying","type":"uint128"},{"name":"price-feed-1","type":{"optional":{"buffer":{"length":8192}}}},{"name":"price-feed-2","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[market: TypedAbiArg<string, "market">, vault: TypedAbiArg<string, "vault">, amount: TypedAbiArg<number | bigint, "amount">, minUnderlying: TypedAbiArg<number | bigint, "minUnderlying">, priceFeed1: TypedAbiArg<Uint8Array | null, "priceFeed1">, priceFeed2: TypedAbiArg<Uint8Array | null, "priceFeed2">], Response<bigint, bigint>>,
    zestDeposit: {"name":"zest-deposit","access":"public","args":[{"name":"vault","type":"trait_reference"},{"name":"asset","type":"trait_reference"},{"name":"amount","type":"uint128"},{"name":"min-shares","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[vault: TypedAbiArg<string, "vault">, asset: TypedAbiArg<string, "asset">, amount: TypedAbiArg<number | bigint, "amount">, minShares: TypedAbiArg<number | bigint, "minShares">], Response<bigint, bigint>>,
    zestRedeem: {"name":"zest-redeem","access":"public","args":[{"name":"vault","type":"trait_reference"},{"name":"shares","type":"uint128"},{"name":"min-amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[vault: TypedAbiArg<string, "vault">, shares: TypedAbiArg<number | bigint, "shares">, minAmount: TypedAbiArg<number | bigint, "minAmount">], Response<bigint, bigint>>,
    zestRepay: {"name":"zest-repay","access":"public","args":[{"name":"market","type":"trait_reference"},{"name":"asset","type":"trait_reference"},{"name":"amount","type":"uint128"},{"name":"price-feed-1","type":{"optional":{"buffer":{"length":8192}}}},{"name":"price-feed-2","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[market: TypedAbiArg<string, "market">, asset: TypedAbiArg<string, "asset">, amount: TypedAbiArg<number | bigint, "amount">, priceFeed1: TypedAbiArg<Uint8Array | null, "priceFeed1">, priceFeed2: TypedAbiArg<Uint8Array | null, "priceFeed2">], Response<bigint, bigint>>,
    zestSupplyCollateralAdd: {"name":"zest-supply-collateral-add","access":"public","args":[{"name":"market","type":"trait_reference"},{"name":"vault","type":"trait_reference"},{"name":"asset","type":"trait_reference"},{"name":"amount","type":"uint128"},{"name":"min-shares","type":"uint128"},{"name":"price-feed-1","type":{"optional":{"buffer":{"length":8192}}}},{"name":"price-feed-2","type":{"optional":{"buffer":{"length":8192}}}}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[market: TypedAbiArg<string, "market">, vault: TypedAbiArg<string, "vault">, asset: TypedAbiArg<string, "asset">, amount: TypedAbiArg<number | bigint, "amount">, minShares: TypedAbiArg<number | bigint, "minShares">, priceFeed1: TypedAbiArg<Uint8Array | null, "priceFeed1">, priceFeed2: TypedAbiArg<Uint8Array | null, "priceFeed2">], Response<bigint, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_INVALID_AMOUNT: {
  name: 'ERR_INVALID_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    reserve: {
  name: 'reserve',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>
  },
  constants: {
  ERR_INVALID_AMOUNT: {
    isOk: false,
    value: 111_001n
  },
  reserve: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.reserve'
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'zest-interface',
  },
zestMarketTraitV1: {
  "functions": {
    
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'zest-market-trait-v1',
  },
zestVaultTraitV1: {
  "functions": {
    
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch33","clarity_version":"Clarity4",
  contractName: 'zest-vault-trait-v1',
  }
} as const;

export const accounts = {"deployer":{"address":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R","balance":"100000000000000"},"wallet_1":{"address":"SP1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2XG1V316","balance":"100000000000000"},"wallet_2":{"address":"SP2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CH94GRJ","balance":"100000000000000"},"wallet_3":{"address":"SP2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1J5QKA2F","balance":"100000000000000"},"wallet_4":{"address":"SP2NEB84ASENDXKYGJPQW86YXQCEFEX2ZPB1S2EP","balance":"100000000000000"},"wallet_5":{"address":"SP2REHHS5J3CERCRBEPMGH7921Q6PYKAADR2V8W5C","balance":"100000000000000"},"wallet_6":{"address":"SP3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ3JJEPMJ","balance":"100000000000000"},"wallet_7":{"address":"SP3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXFA1W3C2","balance":"100000000000000"},"wallet_8":{"address":"SP3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N6R5192Q","balance":"100000000000000"},"wbtc_deployer":{"address":"SPNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2C69MJD9","balance":"100000000000000"}} as const;

export const identifiers = {"blacklist":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.blacklist","blacklistSusdh":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.blacklist-susdh","controller":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.controller","controllerHbtc":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.controller-hbtc","emergencyRecover":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.emergency-recover","feeCollector":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.fee-collector","graniteBorrowerTraitV1":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.granite-borrower-trait-v1","graniteInterface":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.granite-interface","hbtcToken":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.hbtc-token","hermeticaInterface":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.hermetica-interface","hq":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.hq","hqHbtc":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.hq-hbtc","interimTokenTrait":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.interim-token-trait","minting":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting","mintingAuto":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-auto","mintingAutoState":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-auto-state","mintingAutoTrait":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-auto-trait","mintingOtc":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-otc","mintingState":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-state","redeemingReserve":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.redeeming-reserve","reserve":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.reserve","reserveFund":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.reserve-fund","sip010Trait":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.sip-010-trait","staking":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking","stakingReserve":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking-reserve","stakingSilo":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking-silo","stakingSiloTrait":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking-silo-trait","stakingState":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking-state","stakingTrait":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking-trait","state":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.state","susdhToken":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.susdh-token","tokenMigrationTrait":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.token-migration-trait","trading":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.trading","usdhToken":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.usdh-token","vault":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.vault","vaultTraitV1":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.vault-trait-v1","zestInterface":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.zest-interface","zestMarketTraitV1":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.zest-market-trait-v1","zestVaultTraitV1":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.zest-vault-trait-v1"} as const

export const simnet = {
  accounts,
  contracts,
  identifiers,
} as const;


export const deployments = {"blacklist":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.blacklist","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.blacklist","testnet":null,"mainnet":null},"blacklistSusdh":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.blacklist-susdh","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.blacklist-susdh","testnet":null,"mainnet":null},"controller":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.controller","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.controller","testnet":null,"mainnet":null},"controllerHbtc":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.controller-hbtc","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.controller-hbtc","testnet":null,"mainnet":null},"emergencyRecover":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.emergency-recover","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.emergency-recover","testnet":null,"mainnet":null},"feeCollector":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.fee-collector","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.fee-collector","testnet":null,"mainnet":null},"graniteBorrowerTraitV1":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.granite-borrower-trait-v1","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.granite-borrower-trait-v1","testnet":null,"mainnet":null},"graniteInterface":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.granite-interface","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.granite-interface","testnet":null,"mainnet":null},"hbtcToken":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.hbtc-token","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.hbtc-token","testnet":null,"mainnet":null},"hermeticaInterface":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.hermetica-interface","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.hermetica-interface","testnet":null,"mainnet":null},"hq":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.hq","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.hq","testnet":null,"mainnet":null},"hqHbtc":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.hq-hbtc","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.hq-hbtc","testnet":null,"mainnet":null},"interimTokenTrait":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.interim-token-trait","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.interim-token-trait","testnet":null,"mainnet":null},"minting":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting","testnet":null,"mainnet":null},"mintingAuto":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-auto","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-auto","testnet":null,"mainnet":null},"mintingAutoState":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-auto-state","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-auto-state","testnet":null,"mainnet":null},"mintingAutoTrait":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-auto-trait","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-auto-trait","testnet":null,"mainnet":null},"mintingOtc":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-otc","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-otc","testnet":null,"mainnet":null},"mintingState":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-state","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.minting-state","testnet":null,"mainnet":null},"redeemingReserve":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.redeeming-reserve","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.redeeming-reserve","testnet":null,"mainnet":null},"reserve":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.reserve","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.reserve","testnet":null,"mainnet":null},"reserveFund":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.reserve-fund","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.reserve-fund","testnet":null,"mainnet":null},"sip010Trait":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.sip-010-trait","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.sip-010-trait","testnet":null,"mainnet":null},"staking":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking","testnet":null,"mainnet":null},"stakingReserve":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking-reserve","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking-reserve","testnet":null,"mainnet":null},"stakingSilo":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking-silo","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking-silo","testnet":null,"mainnet":null},"stakingSiloTrait":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking-silo-trait","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking-silo-trait","testnet":null,"mainnet":null},"stakingState":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking-state","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking-state","testnet":null,"mainnet":null},"stakingTrait":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking-trait","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.staking-trait","testnet":null,"mainnet":null},"state":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.state","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.state","testnet":null,"mainnet":null},"susdhToken":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.susdh-token","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.susdh-token","testnet":null,"mainnet":null},"tokenMigrationTrait":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.token-migration-trait","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.token-migration-trait","testnet":null,"mainnet":null},"trading":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.trading","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.trading","testnet":null,"mainnet":null},"usdhToken":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.usdh-token","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.usdh-token","testnet":null,"mainnet":null},"vault":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.vault","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.vault","testnet":null,"mainnet":null},"vaultTraitV1":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.vault-trait-v1","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.vault-trait-v1","testnet":null,"mainnet":null},"zestInterface":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.zest-interface","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.zest-interface","testnet":null,"mainnet":null},"zestMarketTraitV1":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.zest-market-trait-v1","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.zest-market-trait-v1","testnet":null,"mainnet":null},"zestVaultTraitV1":{"devnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.zest-vault-trait-v1","simnet":"SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R.zest-vault-trait-v1","testnet":null,"mainnet":null}} as const;

export const project = {
  contracts,
  deployments,
} as const;
  