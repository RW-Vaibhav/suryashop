using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly PasswordHasher<User> _passwordHasher;

    public AuthController(AppDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = new PasswordHasher<User>();
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
    {
        if (await _context.Users.AnyAsync(x => x.Email.ToLower() == registerDto.Email.ToLower()))
        {
            return BadRequest("An account with this email already exists.");
        }

        var user = new User
        {
            Username = registerDto.Username,
            Email = registerDto.Email,
            Role = "Customer" // Default role
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, registerDto.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            Username = user.Username,
            Email = user.Email,
            Token = _tokenService.CreateToken(user),
            Role = user.Role
        };
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
    {
        var user = await _context.Users.SingleOrDefaultAsync(x => x.Email.ToLower() == loginDto.Email.ToLower());

        if (user == null)
        {
            return Unauthorized("Invalid email or password.");
        }

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, loginDto.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized("Invalid email or password.");
        }

        return new AuthResponseDto
        {
            Username = user.Username,
            Email = user.Email,
            Token = _tokenService.CreateToken(user),
            Role = user.Role
        };
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<AuthResponseDto>> GetCurrentUser()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users.SingleOrDefaultAsync(x => x.Email == email);
        if (user == null)
        {
            return NotFound("User not found.");
        }

        return new AuthResponseDto
        {
            Username = user.Username,
            Email = user.Email,
            Token = _tokenService.CreateToken(user),
            Role = user.Role
        };
    }
}
