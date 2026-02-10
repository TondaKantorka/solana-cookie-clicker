/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/cookie.json`.
 */
export type Cookie = {
  "address": "H9BK2gP55dKbadkAwroaTZo5L5vw3QuDtSLmE6WbWKE9",
  "metadata": {
    "name": "cookie",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "chopTree",
      "discriminator": [
        120,
        56,
        196,
        91,
        213,
        182,
        36,
        28
      ],
      "accounts": [
        {
          "name": "sessionToken",
          "optional": true
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "player.authority",
                "account": "playerData"
              }
            ]
          }
        },
        {
          "name": "gameData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "levelSeed"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "levelSeed",
          "type": "string"
        },
        {
          "name": "counter",
          "type": "u16"
        }
      ]
    },
    {
      "name": "claimPluginCookies",
      "discriminator": [
        178,
        208,
        117,
        84,
        179,
        177,
        229,
        252
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "signer": true,
          "relations": [
            "playerPluginSlot"
          ]
        },
        {
          "name": "playerPluginSlot",
          "docs": [
            "Player's plugin slot for this tier"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  112,
                  108,
                  117,
                  103,
                  105,
                  110,
                  95,
                  115,
                  108,
                  111,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "player"
              },
              {
                "kind": "arg",
                "path": "tier"
              }
            ]
          }
        },
        {
          "name": "playerTokenAccount",
          "docs": [
            "Player's cookie token account (to receive cookies)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "player"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "cookieMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "cookieMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "tier",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createMint",
      "discriminator": [
        69,
        44,
        215,
        132,
        253,
        214,
        41,
        45
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The admin account that can create the mint",
            "TODO: Add address constraint with proper admin pubkey"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "rewardTokenMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "metadataAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ]
              },
              {
                "kind": "account",
                "path": "rewardTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenMetadataProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        }
      ]
    },
    {
      "name": "createPlugin",
      "discriminator": [
        210,
        213,
        78,
        20,
        110,
        209,
        221,
        41
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "playerData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "plugin",
          "docs": [
            "Plugin account - PDA seeded by plugin_id"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  117,
                  103,
                  105,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "player_data.plugin_global_counter",
                "account": "playerData"
              }
            ]
          }
        },
        {
          "name": "creatorTokenAccount",
          "docs": [
            "Creator's cookie token account (to burn creation cost)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "cookieMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "cookieMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tier",
          "type": "u8"
        },
        {
          "name": "metadataUri",
          "type": "string"
        },
        {
          "name": "creatorShareBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initPlayer",
      "discriminator": [
        114,
        27,
        219,
        144,
        50,
        15,
        228,
        66
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "gameData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "levelSeed"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "levelSeed",
          "type": "string"
        }
      ]
    },
    {
      "name": "installPlugin",
      "discriminator": [
        136,
        37,
        116,
        68,
        189,
        124,
        6,
        99
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "playerData",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "plugin",
          "docs": [
            "Plugin to install"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  117,
                  103,
                  105,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "plugin.plugin_id",
                "account": "plugin"
              }
            ]
          }
        },
        {
          "name": "playerPluginSlot",
          "docs": [
            "Player's plugin slot for this tier"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  112,
                  108,
                  117,
                  103,
                  105,
                  110,
                  95,
                  115,
                  108,
                  111,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "player"
              },
              {
                "kind": "account",
                "path": "plugin.tier",
                "account": "plugin"
              }
            ]
          }
        },
        {
          "name": "playerTokenAccount",
          "docs": [
            "Player's cookie token account (to pay install cost)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "player"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "cookieMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creatorTokenAccount",
          "docs": [
            "Creator's cookie token account (to receive revenue share)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "plugin.creator",
                "account": "plugin"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "cookieMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "cookieMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "onClick",
      "discriminator": [
        161,
        191,
        8,
        211,
        178,
        196,
        182,
        220
      ],
      "accounts": [
        {
          "name": "sessionToken",
          "optional": true
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "player.authority",
                "account": "playerData"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "playerAuthority",
          "writable": true
        },
        {
          "name": "playerTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "playerAuthority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "rewardTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "rewardTokenMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "uninstallPlugin",
      "discriminator": [
        99,
        185,
        228,
        160,
        167,
        137,
        140,
        174
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "signer": true,
          "relations": [
            "playerPluginSlot"
          ]
        },
        {
          "name": "playerPluginSlot",
          "docs": [
            "Player's plugin slot for this tier"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  112,
                  108,
                  117,
                  103,
                  105,
                  110,
                  95,
                  115,
                  108,
                  111,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "player"
              },
              {
                "kind": "arg",
                "path": "tier"
              }
            ]
          }
        },
        {
          "name": "playerTokenAccount",
          "docs": [
            "Player's cookie token account (to receive final cookies)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "player"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "cookieMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "cookieMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "tier",
          "type": "u8"
        }
      ]
    },
    {
      "name": "unlockTier",
      "discriminator": [
        123,
        100,
        192,
        160,
        182,
        237,
        184,
        152
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "playerData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "playerTokenAccount",
          "docs": [
            "Player's cookie token account (to burn unlock cost)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "player"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "cookieMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "cookieMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "tier",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "gameData",
      "discriminator": [
        237,
        88,
        58,
        243,
        16,
        69,
        238,
        190
      ]
    },
    {
      "name": "playerData",
      "discriminator": [
        197,
        65,
        216,
        202,
        43,
        139,
        147,
        128
      ]
    },
    {
      "name": "playerPluginSlot",
      "discriminator": [
        248,
        102,
        253,
        138,
        111,
        187,
        11,
        128
      ]
    },
    {
      "name": "plugin",
      "discriminator": [
        3,
        199,
        88,
        224,
        120,
        206,
        239,
        225
      ]
    },
    {
      "name": "sessionToken",
      "discriminator": [
        233,
        4,
        115,
        14,
        46,
        21,
        1,
        15
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "notEnoughEnergy",
      "msg": "Not enough energy"
    },
    {
      "code": 6001,
      "name": "wrongAuthority",
      "msg": "Wrong Authority"
    },
    {
      "code": 6002,
      "name": "notEnoughHealth",
      "msg": "Not enough health"
    },
    {
      "code": 6003,
      "name": "invalidTier",
      "msg": "Invalid tier (must be 1-10)"
    },
    {
      "code": 6004,
      "name": "metadataUriTooLong",
      "msg": "Metadata URI too long (max 200 characters)"
    },
    {
      "code": 6005,
      "name": "invalidRevenueShare",
      "msg": "Invalid revenue share (must be <= 100%)"
    },
    {
      "code": 6006,
      "name": "tierNotUnlocked",
      "msg": "Tier not unlocked"
    },
    {
      "code": 6007,
      "name": "tierAlreadyUnlocked",
      "msg": "Tier already unlocked"
    },
    {
      "code": 6008,
      "name": "noPluginInstalled",
      "msg": "No plugin installed in this slot"
    },
    {
      "code": 6009,
      "name": "nothingToClaim",
      "msg": "Nothing to claim yet"
    },
    {
      "code": 6010,
      "name": "overflow",
      "msg": "Arithmetic overflow"
    }
  ],
  "types": [
    {
      "name": "gameData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalWoodCollected",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "playerData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "level",
            "type": "u8"
          },
          {
            "name": "xp",
            "type": "u64"
          },
          {
            "name": "wood",
            "type": "u64"
          },
          {
            "name": "energy",
            "type": "u64"
          },
          {
            "name": "lastLogin",
            "type": "i64"
          },
          {
            "name": "lastId",
            "type": "u16"
          },
          {
            "name": "unlockedTiers",
            "docs": [
              "Bitmask for unlocked tiers (bits 0-9 for tiers 1-10)",
              "Tier 1 is unlocked by default (bit 0 = 1)"
            ],
            "type": "u16"
          },
          {
            "name": "pluginGlobalCounter",
            "docs": [
              "Global counter for creating unique plugin IDs"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "playerPluginSlot",
      "docs": [
        "Player's plugin slot - each player has 10 slots (one per tier)",
        "Represents an instance of a plugin installed by a player"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "docs": [
              "The player who owns this slot"
            ],
            "type": "pubkey"
          },
          {
            "name": "tier",
            "docs": [
              "Which tier slot this is (1-10)"
            ],
            "type": "u8"
          },
          {
            "name": "pluginId",
            "docs": [
              "Which plugin is installed (0 = empty slot)"
            ],
            "type": "u64"
          },
          {
            "name": "installedAt",
            "docs": [
              "When this plugin was installed"
            ],
            "type": "i64"
          },
          {
            "name": "lastClaim",
            "docs": [
              "Last time cookies were claimed from this plugin"
            ],
            "type": "i64"
          },
          {
            "name": "totalClaimed",
            "docs": [
              "Total cookies claimed from this plugin instance (lifetime)"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "plugin",
      "docs": [
        "Plugin account - represents a player-created plugin template",
        "One plugin can be installed by many players"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pluginId",
            "docs": [
              "Unique sequential ID for this plugin"
            ],
            "type": "u64"
          },
          {
            "name": "creator",
            "docs": [
              "Creator of the plugin (receives revenue share)"
            ],
            "type": "pubkey"
          },
          {
            "name": "tier",
            "docs": [
              "Tier of this plugin (1-10)"
            ],
            "type": "u8"
          },
          {
            "name": "metadataUri",
            "docs": [
              "URI to JSON metadata (icon, background, name, description)"
            ],
            "type": "string"
          },
          {
            "name": "totalInstalls",
            "docs": [
              "Total number of times this plugin has been installed"
            ],
            "type": "u64"
          },
          {
            "name": "creatorEarnings",
            "docs": [
              "Total cookies earned by creator from this plugin"
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "When this plugin was created"
            ],
            "type": "i64"
          },
          {
            "name": "creatorShareBps",
            "docs": [
              "Revenue share to creator in basis points (default 2000 = 20%)"
            ],
            "type": "u16"
          },
          {
            "name": "burnShareBps",
            "docs": [
              "Revenue share burned in basis points (default 8000 = 80%)"
            ],
            "type": "u16"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "sessionToken",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "targetProgram",
            "type": "pubkey"
          },
          {
            "name": "sessionSigner",
            "type": "pubkey"
          },
          {
            "name": "validUntil",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
