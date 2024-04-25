﻿using System.Collections.Generic;
using System.Numerics;
using Microsoft.AspNetCore.SignalR;

namespace _5InARow.Hubs;

public class GameHub : Hub
{
    private static readonly List<Group> groups = [];
    private static readonly List<Client> clients = [];

    public async Task NewMessage(string username, string message)
    {
        Console.WriteLine(message);
        await Clients.All.SendAsync("ReceiveMessage", username, message);
    }

    public async Task RemoveFromGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

        await Clients.Group(groupName).SendAsync("Send", $"{Context.ConnectionId} has left the group {groupName}.");
    }

    public async Task GetGroups()
    {
        var filteredGroups = groups.FindAll(group => group.Clients.Count() < 2);
        await Clients.All.SendAsync("GetGroups", filteredGroups.ToArray());
    }

    public async Task RegisterClient(string username)
    {
        Client? client = clients.Find(x => x.ConnectionId == Context.ConnectionId);
        if (client == null)
        {
            client = new Client { ConnectionId = Context.ConnectionId, Username = username };
            clients.Add(client);
        }
        client.Username = username;
        await Clients.Caller.SendAsync("clientJoined", username);
    }

    public async Task RegisterGroup(string groupName)
    {
        //registerd user
        Client? client = clients.Find(x => x.ConnectionId == Context.ConnectionId);
        //registerd groups
        Group? group = groups.Find(x => x.GroupName == groupName);
        //Create new Group if group dont exist and user exist
        if (group == null)
        {
            if (client != null)
            {
                group = new() { GroupName = groupName };
                group.Clients.Add(client);
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
                groups.Add(group);
            }
        }
        //Add existing user to existing group, if he isnt already in it
        else
        {
            var userInGroup = group.Clients.Find(x => x.ConnectionId == Context.ConnectionId);
            if (client != null && userInGroup == null)
            {
                group.Clients.Add(client);
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            }
        }
        await GetGroups();
    }

    public async Task StartGame(string groupname)
    {
        Group? group = groups.Find(x => x.GroupName == groupname);
        if (group != null && group.Clients.Count() == 2)
        {
            await Clients.All.SendAsync("BoardInit", group.Board);
        }
        else
        {
            await Clients.All.SendAsync("NotEnoughPLayer");
        }
    }

    public async Task PlacePiece(int x_boardField, int y_boardField, string groupName)
    {
        Group? group = groups.SingleOrDefault(x => x.GroupName == groupName);
        if (group != null)
        {
            var player1 = group.Clients[0].ConnectionId == Context.ConnectionId;
            var player2 = group.Clients[1].ConnectionId == Context.ConnectionId;
            if (player1 && group.Player1Turn)
            {
                group.Board[y_boardField, x_boardField] = "X";
                group.Player1Turn = !group.Player1Turn;
                await Clients.All.SendAsync("PiecePlaced", group.Board, group.Player1Turn);
                if (CalcWinner(group)) await Clients.All.SendAsync($"Winner", group.Clients[0].Username);
            }
            if (!(!player2 || group.Player1Turn))
            {
                group.Board[y_boardField, x_boardField] = "O";
                group.Player1Turn = !group.Player1Turn;
                await Clients.All.SendAsync("PiecePlaced", group.Board, group.Player1Turn);
                if (CalcWinner(group)) await Clients.All.SendAsync($"Winner", group.Clients[1].Username);
            }
        }
    }
    private bool CalcWinner(Group group)
    {
        // Check rows
        for (var column_index = 0; column_index < 3; column_index++)
        {
            if (group.Board[column_index, 0] != null && group.Board[column_index, 0] == group.Board[column_index, 1] && group.Board[column_index, 1] == group.Board[column_index, 2])
            {
                return true;
            }
        }
        // Check columns
        for (var column_index = 0; column_index < 3; column_index++)
        {
            if (group.Board[0, column_index] != null
                && group.Board[0, column_index] == group.Board[1, column_index]
                && group.Board[1, column_index] == group.Board[2, column_index])
            {
                return true;
            }
        }
        // Check left-right diagonal
        if (group.Board[0, 0] != null && group.Board[0, 0] == group.Board[1, 1]
            && group.Board[1, 1] == group.Board[2, 2])
        {
            return true;
        }
        // Check right-left diagonal
        if (group.Board[0, 2] != null && group.Board[1, 1] == group.Board[2, 0]
            && group.Board[1, 1] == group.Board[0, 2])
        {
            return true;
        }
        return false;
    }
}


public class Group
{
    public required string GroupName { get; set; }
    public List<Client> Clients { get; } = new List<Client>();

    public string[,] Board { get; } = new string[3, 3];

    public Boolean Player1Turn { get; set; } = true;
}
public class Client
{
    public required string ConnectionId { get; set; }
    public required string Username { get; set; }
}
