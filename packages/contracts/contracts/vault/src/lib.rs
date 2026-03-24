#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env,
};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum VaultStatus {
    Active,
    Paused,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    Token,
    Status,
    Balance(Address),
    TotalDeposits,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum VaultError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    InsufficientBalance = 4,
    InvalidAmount = 5,
    VaultPaused = 6,
}

fn require_initialized(env: &Env) {
    if !env.storage().instance().has(&DataKey::Admin) {
        panic_with_error!(env, VaultError::NotInitialized);
    }
}

fn require_active(env: &Env) {
    let status: VaultStatus = env
        .storage()
        .instance()
        .get(&DataKey::Status)
        .unwrap_or(VaultStatus::Paused);
    if status != VaultStatus::Active {
        panic_with_error!(env, VaultError::VaultPaused);
    }
}

fn require_admin(env: &Env, caller: &Address) {
    let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
    if *caller != admin {
        panic_with_error!(env, VaultError::Unauthorized);
    }
}

fn get_balance(env: &Env, user: &Address) -> i128 {
    env.storage()
        .persistent()
        .get(&DataKey::Balance(user.clone()))
        .unwrap_or(0)
}

fn set_balance(env: &Env, user: &Address, amount: i128) {
    env.storage()
        .persistent()
        .set(&DataKey::Balance(user.clone()), &amount);
}

fn get_total(env: &Env) -> i128 {
    env.storage()
        .instance()
        .get(&DataKey::TotalDeposits)
        .unwrap_or(0)
}

fn set_total(env: &Env, amount: i128) {
    env.storage().instance().set(&DataKey::TotalDeposits, &amount);
}

use soroban_sdk::panic_with_error;

#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    pub fn initialize(env: Env, admin: Address, token_address: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, VaultError::AlreadyInitialized);
        }

        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::Token, &token_address);
        env.storage()
            .instance()
            .set(&DataKey::Status, &VaultStatus::Active);
        env.storage()
            .instance()
            .set(&DataKey::TotalDeposits, &0_i128);
    }

    pub fn deposit(env: Env, user: Address, amount: i128) -> i128 {
        require_initialized(&env);
        require_active(&env);

        if amount <= 0 {
            panic_with_error!(&env, VaultError::InvalidAmount);
        }

        user.require_auth();

        let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let contract_address = env.current_contract_address();

        token::Client::new(&env, &token_address).transfer(&user, &contract_address, &amount);

        let new_balance = get_balance(&env, &user) + amount;
        set_balance(&env, &user, new_balance);

        let new_total = get_total(&env) + amount;
        set_total(&env, new_total);

        env.events().publish(
            (symbol_short!("DEPOSIT"), user.clone()),
            (amount, new_balance),
        );

        new_balance
    }

    pub fn withdraw(env: Env, user: Address, amount: i128) -> i128 {
        require_initialized(&env);

        if amount <= 0 {
            panic_with_error!(&env, VaultError::InvalidAmount);
        }

        user.require_auth();

        let current_balance = get_balance(&env, &user);
        if amount > current_balance {
            panic_with_error!(&env, VaultError::InsufficientBalance);
        }

        let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let contract_address = env.current_contract_address();

        token::Client::new(&env, &token_address).transfer(&contract_address, &user, &amount);

        let new_balance = current_balance - amount;
        set_balance(&env, &user, new_balance);

        let new_total = get_total(&env) - amount;
        set_total(&env, new_total);

        env.events().publish(
            (symbol_short!("WITHDRAW"), user.clone()),
            (amount, new_balance),
        );

        new_balance
    }

    pub fn get_balance(env: Env, user: Address) -> i128 {
        require_initialized(&env);
        get_balance(&env, &user)
    }

    pub fn get_total_deposits(env: Env) -> i128 {
        require_initialized(&env);
        get_total(&env)
    }

    pub fn pause(env: Env, admin: Address) {
        require_initialized(&env);
        admin.require_auth();
        require_admin(&env, &admin);
        env.storage()
            .instance()
            .set(&DataKey::Status, &VaultStatus::Paused);
    }

    pub fn unpause(env: Env, admin: Address) {
        require_initialized(&env);
        admin.require_auth();
        require_admin(&env, &admin);
        env.storage()
            .instance()
            .set(&DataKey::Status, &VaultStatus::Active);
    }

    pub fn get_status(env: Env) -> VaultStatus {
        require_initialized(&env);
        env.storage()
            .instance()
            .get(&DataKey::Status)
            .unwrap_or(VaultStatus::Paused)
    }

    pub fn get_token(env: Env) -> Address {
        require_initialized(&env);
        env.storage().instance().get(&DataKey::Token).unwrap()
    }
}

#[cfg(test)]
mod test;
