using Microsoft.AspNetCore.Authorization;

namespace Commerce.Api.Auth;

public sealed class OrderOwnerRequirement : IAuthorizationRequirement {}

public sealed class AccountOwnerRequirement: IAuthorizationRequirement {}